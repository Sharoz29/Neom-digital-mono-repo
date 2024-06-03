import React from "react";
import { Table } from "semantic-ui-react";
import CaseHeader from "./CaseHeader";

export default function CaseTable({ column, direction, rows }) {
  return (
    <Table celled sortable striped selectable compact color="blue">
      <CaseHeader column={column} direction={direction} />
      <Table.Body>{rows}</Table.Body>
    </Table>
  );
}
