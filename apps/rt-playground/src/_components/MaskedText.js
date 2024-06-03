import React from "react";

export const MaskedText = ({ field, label, index }) => {
  const { control, value, testID } = field;
  let displayValueClasses = [];
  const fieldClass = "pr-field-" + control?.type?.replace(/^(px)/, "");
  const dispalyValue = /●/.test(value) ? value : value.replace(/./g, "●");

  if (control?.modes.length > 1 && control?.modes[1]?.textAlign === "Right") {
    displayValueClasses.push("readonlytext-alignright");
  }

  return (
    <div key={index} className={`readonlytext ${fieldClass}`} data-test-id={testID}>
      <label className="readonlytext-label">{label || ""}</label>
      {dispalyValue && <div className={displayValueClasses.join(" ")}>{dispalyValue}</div>}
    </div>
  );
};
