import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Loader, Dimmer } from "semantic-ui-react";

import { caseActions } from "../_actions/case.actions";

export const AttachContent = (props) => {
  
  const dispatch = useDispatch();

  const [uploadInProgress, setUploadInProgress] = useState(false);

  const uploadAttachments = (files) => {
    return dispatch(caseActions.uploadAttachments(files))
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.log("Error is: ", error);
      });
  };

  const saveAttachments = (data, caseID) => {
    return dispatch(caseActions.saveAttachments(data, caseID))
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.log("Error is: ", error);
      });
  };

  const onFileAdded = (event) => {
    const files = event.target.files;
    const arFiles = Array.from(files);
    
    setUploadInProgress(true);
    uploadAttachments(arFiles)
      .then((response) => {
        const attachments = [];
        let oAttachment;
        arFiles.forEach((file) => {
          oAttachment = {
            type: "File",
            category: "File",
            ID: response.fileResponse.ID,
            name: arFiles[0].name,
          };
          attachments.push(oAttachment);
        });

        saveAttachments(attachments, props.caseID)
          .then(() => {
            setUploadInProgress(false);
          })
          .catch((error) => {
            console.log("Error is: ", error);
            setUploadInProgress(false);
          });
      })
      .catch((error) => {
        setUploadInProgress(false);
        console.log("Error is: ", error);
      });
  };

  return (
    <div className={props.className}>
      <input
        style={{ display: "none" }}
        id="upload-photo"
        name="upload-photo"
        type="file"
        onChange={onFileAdded}
        multiple={true}
      />
      <Button
        as="label"
        htmlFor="upload-photo"
        type="button"
        variant="outlined"
        className="primary"
        component="span"
      >
        Upload File
      </Button>
      {uploadInProgress && (
        <Dimmer active inverted>
          <Loader />
        </Dimmer>
      )}
    </div>
  );
};
