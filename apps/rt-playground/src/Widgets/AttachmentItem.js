import React from "react";
import { Button } from "semantic-ui-react";
import download from "downloadjs";

import "./AttachmentItem.css";

export default function AttachmentItem(props) {
  const handleDownload = () => {
    props.download(props.arItem).then((content) => {
      const fileData = props.arItem;
      download(window.atob(content.data), fileData.fileName);
    });
  };

  const handleDelete = () => {
    props.delete(props.arItem);
  };

  return (
    <>
      <div className="widget-card">
        <div className="widget-card-main">
          <div>{`${props.arItem.name}`}</div>
          <Button.Group floated="left">
            <Button type="button" disabled={props.deleteDisabled} onClick={handleDelete}>
              Delete
            </Button>
            <Button type="button" className="primary" onClick={handleDownload}>
              Download
            </Button>
          </Button.Group>
        </div>
      </div>
    </>
  );
}
