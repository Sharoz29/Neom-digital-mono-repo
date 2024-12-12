/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, OnInit, Input, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import isEqual from 'fast-deep-equal';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { Utils } from '../../../_helpers/utils';

declare const window: any;

@Component({
  selector: 'app-feed-container',
  templateUrl: './feed-container.component.html',
  styleUrls: ['./feed-container.component.scss'],
  providers: [Utils],
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatGridListModule, MatButtonModule]
})
export class FeedContainerComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;

  // Used with AngularPConnect
  angularPConnectData: AngularPConnectData = {};

  userName$: string;
  imageKey$: string;

  currentUserInitials$: string;
  currentUserName$: string;

  pulseMessages$: any[] = [];
  showReplyComment$: Object = {};

  svgComment$: string;
  svgLike$: string;
  svgLikedByMe$: string;
  svgSend$: string;
  svgDelete$: string;
  svgMenu$: string;
  openMenuId: string | null = null;

  pulseConversation: string;
  userData: Map<any, any> = new Map();

  pulseComment: Object = {};

  likedUsers: any[] = [];
  likedCommenst: any[] = [];

  // functions
  actionsAPI: any;
  // until FeedAPI moved back to PCore, we access the methods directly (see ngInit)
  feedAPI: any;

  pulseData: any;

  // Temporary way to use FeedApi...
  fetchMessages: any;
  likeMessage: any;
  postMessage: any;

  constructor(private angularPConnect: AngularPConnectService, private cdRef: ChangeDetectorRef, public utils: Utils) {}

  ngOnInit(): void {
    this.userName$ = PCore.getEnvironmentInfo().getOperatorName();
    this.imageKey$ = PCore.getEnvironmentInfo().getOperatorImageInsKey();
    this.updateCurrentUserName(this.userName$);

    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);
    this.feedAPI = PCore.getFeedUtils();

    let value = '';
    let feedID = '';
    let feedClass = '';
    const appName = PCore.getEnvironmentInfo().getApplicationName();

    if (this.pConn$.getCaseSummary().ID) {
      value = this.pConn$.getCaseSummary().ID;
      feedID = 'pyCaseFeed';
      feedClass = this.pConn$.getCaseSummary().content.classID;
    } else {
      value = `DATA-PORTAL $${appName}`;
      feedID = 'pyDashboardFeed';
      feedClass = '@baseclass';
    }
    this.feedAPI
      // @ts-ignore: Argument of type '[]' is not assignable to parameter of type '[any]'
      .getFeeds('DATA-PORTAL $CallADoc', feedID, feedClass, [], [], this.pConn$, false, '')
      .then(feedResponse => {
        console.log(feedResponse);
      })
      .catch(err => {
        console.log(err);
      });

    const onUploadProgress = () => {};
    const errorHandler = () => {};
    const attachments = () => {};

    const postComment = ({ value: message, clear }) => {
      const attachmentIDs = [];
      const attachmentUtils = PCore.getAttachmentUtils();
      if (attachments && !!attachments.length) {
        /* attachments;
          .filter((file) => !file.error)
          .map((file) => {
            return attachmentUtils
              .uploadAttachment(file, onUploadProgress, errorHandler)
              .then((fileResponse) => {
                const fileConfig = {
                  type: "File",
                  category: "File",
                  fileName: file.name,
                  ID: fileResponse.data.ID
                };
                attachmentIDs.push(fileConfig);
                if (attachments.length === attachmentIDs.length) {
                  postMessage(
                    value,
                    transformMarkdownToMsg(message),
                    attachmentIDs
                  );
                  clear();
                  setAttachments([]);
                }
              })

              .catch(console.error);
          }); */
      } else {
        // postMessage(value, transformMarkdownToMsg(message));
        clear();
      }
    };

    // set up svg images
    this.svgComment$ = this.utils.getImageSrc('chat', this.utils.getSDKStaticContentUrl());
    this.svgLike$ = this.utils.getImageSrc('thumbs-up', this.utils.getSDKStaticContentUrl());
    this.svgLikedByMe$ = this.utils.getImageSrc('thumbs-up-solid', this.utils.getSDKStaticContentUrl());
    this.svgSend$ = this.utils.getImageSrc('send', this.utils.getSDKStaticContentUrl());
    this.svgDelete$ = this.utils.getImageSrc('delete', this.utils.getSDKStaticContentUrl());
    this.svgMenu$ = this.utils.getImageSrc('more', this.utils.getSDKStaticContentUrl());
  }

  ngOnDestroy(): void {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  // Callback passed when subscribing to store change
  onStateChange() {
    const bLogging = false;
    if (bLogging) {
      console.log(`in ${this.constructor.name} onStateChange`);
    }
    // Should always check the bridge to see if the component should update itself (re-render)
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);

    if (bUpdateSelf) {
      this.updateSelf();
    } else {
      const newPulseData = this.pConn$.getDataObject().pulse;

      if (!isEqual(newPulseData, this.pulseData)) {
        this.updateSelf();
      }
    }

    this.pulseData = this.pConn$.getDataObject().pulse;
  }

  updateSelf() {
    console.log('I have been called');
    this.getMessageData();
  }

  getMessageData() {
    const messageIDs = (this.pConn$.getConfigProps() as any).messageIDs;
    const userName = (this.pConn$.getConfigProps() as any).currentUser;
    const imageKey = this.pConn$.getValue('OperatorID.pyImageInsKey');

    const oData: any = this.pConn$.getDataObject();

    if (messageIDs && messageIDs.length > 0) {
      let filteredPulseMessages$ = oData.pulse.messages;
      for (let key in filteredPulseMessages$) {
        if (!messageIDs.includes(key)) {
          delete filteredPulseMessages$[key];
        }
      }
      this.pulseMessages$ = Object.values(filteredPulseMessages$);

      // create a copy, so we can modify
      this.pulseMessages$ = this.appendPulseMessage(this.pulseMessages$);

      // most recent on top
      this.pulseMessages$ = this.pulseMessages$.sort((a, b) => (a.updateTimeUTC < b.updateTimeUTC ? 1 : -1));

      for (let i = 0; i < this.pulseMessages$.length; i++) {
        const msg = this.pulseMessages$[i];

        if (msg?.['pxResults'] && msg?.['pxResults'].length > 0) {
          const comments = msg?.['pxResults'];

          for (let j = 0; j < comments.length; j++) {
            const comment = comments[j];

            PCore.getFeedUtils()
              .getLikedUsers(comment.pzInsKey, this.pConn$)
              .then(res => {
                console.log(res, 'Sharoz');
                if (res.length > 0) {
                  const existsInLikedComments = this.likedCommenst.some(item => item.msgID === comment.pzInsKey);
                  if (!existsInLikedComments) {
                    this.likedCommenst.push({ likedUsers: res, msgID: comment.pzInsKey });
                  }
                }
              });
          }
        }

        PCore.getFeedUtils()
          .getLikedUsers(msg.ID, this.pConn$)
          .then(res => {
            const existsInLikedUsers = this.likedUsers.some(item => item.msgID === msg.ID);
            if (!existsInLikedUsers) {
              if (res.length > 0) {
                this.likedUsers.push({ likedUsers: res, msgID: msg.ID });
              }
            }
          });
      }
    }
  }

  convertToArray(messages: any[]): any[] {
    const arMessages: any[] = [];

    for (let i = 0; i < messages.length; i++) {
      arMessages.push(messages[i]);
    }

    return arMessages;
  }

  appendPulseMessage(messages: any[]): any[] {
    for (let i = 0; i < messages.length; i++) {
      const message: Record<string, any> = { ...messages[i] };
      const postedTime = message?.['pxCreateDateTime'];
      const updatedTime = message?.['updatedTime'];

      this.showReplyComment$[message['ID']] = false;

      message['displayPostedTime'] = this.utils.generateDateTime(postedTime, 'DateTime-Since');

      // for sorting lasted update
      if (updatedTime != null) {
        message['updateTimeUTC'] = new Date(updatedTime).getTime();
      } else {
        message['updateTimeUTC'] = new Date(postedTime).getTime();
      }

      message['displayPostedBy'] = message?.['postedByUser']?.name;
      message['displayPostedByInitials'] = this.utils.getInitials(message['postedByUser'].name);

      // if didn't break, then look at the replies
      for (let j = 0; j < message?.['replies']?.length; j++) {
        const reply = message['replies'][j];

        const replyPostedTime = reply.postedTime;
        reply.displayPostedTime = this.utils.generateDateTime(replyPostedTime, 'DateTime-Since');

        // let oReplyUser = this.userData.get(reply.postedByUser);
        const oReplyUser = reply.postedByUser;

        if (oReplyUser) {
          reply.displayPostedBy = oReplyUser.name;
          reply.displayPostedByInitials = this.utils.getInitials(oReplyUser.name);
        }
      }
    } // for

    return messages;
  }

  updateMessagesWithOperators() {
    for (let i = 0; i < this.pulseMessages$.length; i++) {
      const message = this.pulseMessages$[i];

      const postedTime = message.postedTime;

      this.showReplyComment$[message.ID] = false;

      message.displayPostedTime = this.utils.generateDateTime(postedTime, 'DateTime-Since');

      const oUser = this.userData.get(message.postedBy);

      if (oUser) {
        message.displayPostedBy = oUser.pyUserName;
        message.displayPostedByInitials = this.utils.getInitials(oUser.pyUserName);
      } else {
        const oUserParams = {
          OperatorId: message.postedBy
        };
        // Do something with oUserParams
      }

      // if didn't break, then look at the replies
      for (let j = 0; j < message.replies.length; j++) {
        const reply = message.replies[j];

        const replyPostedTime = reply.postedTime;
        reply.displayPostedTime = this.utils.generateDateTime(replyPostedTime, 'DateTime-Since');

        // let oReplyUser = this.userData.get(reply.postedByUser);
        const oReplyUser = reply.postedByUser;

        if (oReplyUser) {
          reply.displayPostedBy = oReplyUser.name;
          reply.displayPostedByInitials = this.utils.getInitials(oReplyUser.name);
        }
      }
    } // for
  }

  updateCurrentUserName(sUser: string) {
    this.currentUserInitials$ = this.utils.getInitials(sUser);
    this.currentUserName$ = sUser;
  }

  postClick() {
    // don't send a blank message
    if (this.pulseConversation && this.pulseConversation != '') {
      if (this.feedAPI) {
        return this.feedAPI.postMessage('DATA-PORTAL $CallADoc', this.pulseConversation, [], false, this.pConn$);
      } else {
        console.log("We don't support Pulse yet");
      }
    }

    (document.getElementById('pulseMessage') as HTMLElement | any).value = '';
    this.pulseConversation = '';
  }

  messageChange(event: any) {
    this.pulseConversation = event.target.value;
  }
  deletePulseMessage(event: any) {}

  likeClick(messageID: string, rMessageID: string, bLikedByMe: boolean, level: string) {
    let pulseMessage = {};
    if (level === 'top') {
      pulseMessage = {
        pulseContext: messageID,
        likedBy: bLikedByMe,
        messageID,
        isReply: false,
        c11nEnv: this.pConn$
      };
    } else {
      pulseMessage = {
        pulseContext: messageID,
        likedBy: bLikedByMe,
        messageID,
        isReply: true,
        c11nEnv: this.pConn$
      };
    }
    PCore.getFeedUtils()?.likeMessage(pulseMessage);
  }

  isLikedByMe(messageID: string, isComment?: boolean) {
    if (isComment) {
      const commentLikedUsers = this.likedCommenst.filter(user => user.msgID === messageID);
      if (commentLikedUsers.length > 0) {
        for (let user of commentLikedUsers) {
          for (let likedUser of user.likedUsers) {
            if (likedUser.name === this.currentUserName$) {
              return true;
            }
          }
        }
      }
      return false;
    } else {
      const postLikedUsers = this.likedUsers.filter(user => user.msgID === messageID);
      if (postLikedUsers.length > 0) {
        for (let user of postLikedUsers) {
          for (let likedUser of user.likedUsers) {
            if (likedUser.name === this.currentUserName$) {
              return true;
            }
          }
        }
        return false;
      }
      return false;
    }
  }

  commentClick(messageID) {
    // iterator through messages, find match, turn on comment entry
    const foundMessage = this.pulseMessages$.find(message => message.ID === messageID);

    if (foundMessage) {
      this.showReplyComment$[foundMessage.ID] = true;
    }

    this.cdRef.detectChanges();
  }

  postCommentClick(messageID) {
    // debugger;

    if (this.pulseComment[messageID] && this.pulseComment[messageID] != '') {
      // let pulseMessage = {
      //   contextName : this.pConn$.getContextName(),
      //   message: this.pulseComment[messageID],
      //   pulseContext: messageID,
      //   reply: true
      // };

      // debugger;
      // Used to be: this./*feedAPI.*/postMessage(pulseMessage);
      //  Latest update to API has changed and the postMessage actually gets
      //  the pulse context...
      // used to use: contextName
      // new FeedAPI wants args to be messageID, this.pulseComment[messageID], true (since this is a reply)
      this.feedAPI.postMessage(messageID, this.pulseComment[messageID], true);

      this.pulseComment[messageID] = '';
    }
  }

  newCommentChange(event, messageID) {
    this.pulseComment[messageID] = event.target.value;
  }
  toggleMenu(messageId: string): void {
    this.openMenuId = this.openMenuId === messageId ? null : messageId;
  }
}
