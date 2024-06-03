import React from "react";

import AttachmentItem from "./AttachmentItem";

export default function AttachmentList(props) {  
  return (
    <div>
      {props.arItems &&
        props.arItems.map((file) => (
          <AttachmentItem
            key={file.ID}
            arItem={file}
            delete={props.delete}
            download={props.download}
            deleteDisabled={props.deleteDisabled}
          />
        ))}
    </div>
  );
}
