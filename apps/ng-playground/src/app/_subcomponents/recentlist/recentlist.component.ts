import { Component, OnInit } from '@angular/core';
import { GetLoginStatusService } from '../../_messages/getloginstatus.service';
import { Subscription } from 'rxjs';
import { DatapageService } from '../../_services/datapage.service';
import { OpenRecentService } from '../../_messages/openrecent.service';

@Component({
  selector: 'app-recentlist',
  templateUrl: './recentlist.component.html',
  styleUrls: ['./recentlist.component.scss'],
})
export class RecentlistComponent implements OnInit {
  subscription!: Subscription;
  recentList$!: Array<any>;

  constructor(
    private glservice: GetLoginStatusService,
    private dpservice: DatapageService,
    private orservice: OpenRecentService
  ) {
    // if we have a user, get casetypes
    if (sessionStorage.getItem('pega_ng_user')) {
      this.updateRecentList();
    }
  }

  ngOnInit() {
    this.subscription = this.glservice.getMessage().subscribe((message) => {
      if (message.loginStatus === 'LoggedIn') {
        this.updateRecentList();
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  updateRecentList() {
    this.dpservice
      .getDataPage('Declare_pxRecents', { Work: true, Rule: false })
      .subscribe(
        (response: any) => {
          const pxResults = response?.pxResults;
          if (pxResults) {
            this.recentList$ = pxResults;
          }
        },
        (err) => {
          console.log('Errors from get recentlist:' + err.errors);
        }
      );
  }

  openRecent(recent: any) {
    const caseID = recent.pyRecordKey;
    const caseName = recent.pyRecordID;

    this.orservice.sendMessage(caseName, caseID);
  }
}
