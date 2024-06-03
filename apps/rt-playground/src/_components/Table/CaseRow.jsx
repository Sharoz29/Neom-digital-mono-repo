import React from "react";
import { Table } from "semantic-ui-react";
import { format as datefn_format, parseISO as datefn_parseISO } from "date-fns";

export default function CaseRow({ onClick, index, entry }) {
  return (
    <>
      {entry ? (
        <Table.Row onClick={onClick} key={index}>
          <Table.Cell>{entry.pxRefObjectInsName}</Table.Cell>
          <Table.Cell>{entry.pyAssignmentStatus}</Table.Cell>
          <Table.Cell>{entry.pxUrgencyAssign}</Table.Cell>
          <Table.Cell>
            {datefn_format(
              datefn_parseISO(entry.pxCreateDateTime.replace("GMT", "Z")),
              "PPPP p"
            )}
          </Table.Cell>
        </Table.Row>
      ) : (
        <Table.Row>
          <Table.Cell>---</Table.Cell>
          <Table.Cell />
          <Table.Cell />
        </Table.Row>
      )}
    </>
  );
}
