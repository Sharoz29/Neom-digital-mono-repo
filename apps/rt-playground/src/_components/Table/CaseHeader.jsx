import React from "react";
import { headerData } from "../../mockData/mockData";
import { Table } from "semantic-ui-react";

export default function CaseHeader({ column, direction }) {
  let i = 1;
  return (
    <Table.Header key={i++}>
      <Table.Row key={i}>
        {headerData.map((label, index) => (
          <Table.HeaderCell
            width="3"
            //To do (Implement sorting)
            // sorted={column ? direction : null}
            // onClick={() => this.handleSort(column)}
            key={index}
          >
            {label}
          </Table.HeaderCell>
        ))}
      </Table.Row>
    </Table.Header>
  );
}
