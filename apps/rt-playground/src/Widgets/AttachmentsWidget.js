import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Header, Icon, Segment, Loader, Dimmer } from "semantic-ui-react";

import AttachmentList from "./AttachmentList";
import { caseActions } from "../_actions/case.actions";
import "./AttachmentItem.css";

export const AttachmentsWidget = (props) => {
  const [attachmentList, setAttachmentList] = useState([]);
  const [fetchAttachments, setFetchAttachments] = useState(false);

  const dispatch = useDispatch();

  const caseDetails = useSelector((state) => state.cases.caseDetails);
  const attachmentDetails = useSelector(
    (state) => state.cases.attachmentDetails
  );

  const [deleteAttachmentInProgress, setDeleteAttachmentInProgress] = useState(false);
  const [fetchAttachmentsInProgress, setFetchAttachmentsInProgress] = useState(false);

  const getAttachments = (caseID) => {
    setFetchAttachmentsInProgress(true);
    return dispatch(caseActions.getAttachments(caseID)).then((response) => {
      setFetchAttachmentsInProgress(false);
      return response.attachments;
    });
  };

  useEffect(() => {
    if (!fetchAttachments) {
      return;
    }
    getAttachments(props.caseID).then((response) => {
      setFetchAttachments(false);
      setAttachmentList(response);
    });
  }, [fetchAttachments]);

  useEffect(() => {
    getAttachments(props.caseID).then((response) => {
      setAttachmentList(response);
    });
  }, [caseDetails, attachmentDetails]);

  const deleteAttachment = (file) => {
    setDeleteAttachmentInProgress(true);
    return dispatch(caseActions.deleteAttachment(file)).then(() => {
      setFetchAttachments(true);
      setDeleteAttachmentInProgress(false);
    });
  };

  const downloadAttachment = (file) => {
    return dispatch(caseActions.downloadAttachment(file)).then((responseData) => {
      return responseData.response;
    });
  };

  return (
    <>
      <Segment attached="top">
        <Header as="h4" textAlign="center" display="inline-block">
          <div className="widget-header">
            <div className="header-text">{"Attachments"}</div>
            {attachmentList && attachmentList.length > 0 && (
              <div className="widget-count" id="attachment-count">{attachmentList.length}</div>
            )}
            {(!attachmentList || attachmentList.length === 0) && (
              <div className="widget-count" id="attachment-count">{0}</div>
            )}
          </div>
        </Header>
      </Segment>
      <Segment attached="bottom">
        {attachmentList && attachmentList.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <AttachmentList
              arItems={attachmentList}
              delete={deleteAttachment}
              download={downloadAttachment}
              deleteDisabled={props.deleteDisabled}
            />
          </div>
        )}
        {(!attachmentList || attachmentList.length === 0) && (
          <div style={{ marginTop: "1rem" }}>
            No attachments exist for this Case!
          </div>
        )}
        {(fetchAttachmentsInProgress || deleteAttachmentInProgress) && (
          <Dimmer active inverted>
            <Loader />
          </Dimmer>
        )}
      </Segment>
    </>
  );
};
