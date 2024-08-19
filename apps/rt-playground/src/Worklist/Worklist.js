import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Header,
  Segment,
  Pagination,
  Dropdown,
  Container,
  Button,
  Icon,
  Grid,
} from 'semantic-ui-react';
import _ from 'lodash';
import { caseActions, workQueueActions } from '../_actions';
import { assignmentActions } from '../_actions';
import EnhancedTable from '../_components/Table/EnhancedTable';
import { Table } from 'semantic-ui-react';
import { format as datefn_format, parseISO as datefn_parseISO } from 'date-fns';
import { withRouter } from 'react-router-dom/cjs/react-router-dom';
/**
 * React component to show WorkLists and WorkQueues
 */
class Worklist extends Component {
  constructor(props) {
    super(props);

    this.state = {
      column: props.worklistSettings.column,
      direction: props.worklistSettings.direction,
      searchText: '',
      pageSize: 10,
      pages: {
        Worklist: 1,
      },
      current: props.worklistSettings.assignmentType,
      loading: false,
    };
  }

  componentDidMount() {
    this.refreshWorklist(this.state.current);
  }

  componentWillUnmount() {
    this.props.dispatch(
      assignmentActions.saveWorklistSettings(
        this.state.column,
        this.state.direction,
        this.state.current
      )
    );
  }

  refreshWorklist(basketId) {
    this.setState({ loading: true });
    if (basketId !== 'Worklist') {
      this.props
        .dispatch(workQueueActions.getWorkQueue(basketId))
        .then(() => this.setState({ loading: false }));
    } else {
      // Retrieve the case list if that attempt failed on load of PegaApp
      if (this.props.caseTypes.length === 0 && this.props.caseTypesError) {
        this.props.dispatch(caseActions.getCaseTypes());
      }
      this.props
        .dispatch(workQueueActions.getWorkList())
        .then(() => this.setState({ loading: false }));
    }
  }

  getNextAssignment() {
    this.setState({ loading: true });
    this.props
      .dispatch(assignmentActions.getNextAssignment())
      .then((action) => {
        if (action) {
          this.setState({ loading: false });
        }
      });
  }

  openAssignment(id, caseID) {
    this.props.history.push({ pathname: `/cases/${id}`, state: caseID });
  }

  sortAssignments(targetList, column, direction) {
    if (column === 'pxRefObjectInsName') {
      targetList = targetList.sort((x, y) => {
        const prefixX = x.pxRefObjectInsName.split('-');
        const prefixY = y.pxRefObjectInsName.split('-');

        if (prefixX[0] !== prefixY[0]) {
          if (prefixX[0] < prefixY[0]) return -1;
          if (prefixX[0] > prefixY[0]) return 1;
          return 0;
        }
        return prefixX[1] - prefixY[1];
      });
    } else {
      targetList = _.sortBy(targetList, [column]);
    }
    if (direction === 'descending') {
      targetList = targetList.reverse();
    }
    return targetList;
  }

  filterAssignments(targetList, searchText) {
    if (searchText) {
      targetList = targetList.filter((item) =>
        item.pxRefObjectInsName.includes(searchText)
      );
    }
    return targetList;
  }

  getTableData() {
    let targetList =
      this.state.current === 'Worklist'
        ? this.props.workList
        : this.props.workQueues[this.state.current];

    if (targetList && targetList.length > 0) {
      const { column, direction, searchText } = this.state;
      targetList = this.filterAssignments(targetList, searchText);
      targetList = this.sortAssignments(targetList, column, direction);
    }
    return targetList ? targetList : [];
  }
  getTableRows(data, startIndex, endIndex) {
    let targetList = data;
    if (targetList && targetList.length > 0) {
      // Encountered scenario where two entries had same case id...hence using index to always get a unique key
      return targetList.slice(startIndex, endIndex).map((entry, index) => {
        return (
          <>
            {entry ? (
              <Table.Row
                onClick={(e) => {
                  this.openAssignment(entry.pzInsKey, entry.pxRefObjectKey);
                }}
                key={index}
              >
                <Table.Cell>{entry.pxRefObjectInsName}</Table.Cell>
                <Table.Cell>{entry.pyAssignmentStatus}</Table.Cell>
                <Table.Cell>{entry.pxUrgencyAssign}</Table.Cell>
                <Table.Cell>
                  {datefn_format(
                    datefn_parseISO(entry.pxCreateDateTime.replace('GMT', 'Z')),
                    'PPPP p'
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
      });
    }
  }

  getTotalPagesForCurrent(data, pageSize) {
    let count = data.length / pageSize;
    return Math.ceil(count);
  }

  handleSort(clickedColumn) {
    const { column, direction } = this.state;

    if (column !== clickedColumn) {
      this.setState({
        column: clickedColumn,
        direction: 'ascending',
      });
    } else {
      this.setState({
        direction: direction === 'ascending' ? 'descending' : 'ascending',
      });
    }
  }

  getWorkItemTableFromAssignments() {
    const { pages, current, column, direction } = this.state;
    let data = this.getTableData();
    let uniqueLabels = [];

    data.forEach((obj) => {
      if (!uniqueLabels.includes(obj.pyLabel)) {
        uniqueLabels.push(obj.pyLabel);
      }
    });

    const caseTypes = uniqueLabels.map((label) => {
      return data.filter((obj) => obj.pyLabel === label);
    });

    const activePage = pages[current] ? pages[current] : 1;
    const pageSize = this.state.pageSize;
    const endIndex = activePage * pageSize;
    const startIndex = endIndex - pageSize;

    const totalPages = this.getTotalPagesForCurrent(data, pageSize);
    const pageOptions = [
      { key: 5, text: '5', value: 5 },
      { key: 10, text: '10', value: 10 },
      { key: 20, text: '20', value: 20 },
      { key: 30, text: '30', value: 30 },
      { key: 50, text: '50', value: 50 },
    ];
    const columnData = ['Case', 'Status', 'Urgency', 'Create Date'];

    return (
      <div style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
        {caseTypes.map((caseType, i) => {
          const rows = this.getTableRows(caseType, startIndex, endIndex);
          return (
            <div style={{ width: `${100 / caseTypes.length}%` }} key={i}>
              <h3 style={{ textAlign: 'center' }}>{caseType[0]?.pyLabel}</h3>
              <Table celled sortable striped selectable compact color="yellow">
                <Table.Header key={i++}>
                  <Table.Row key={i}>
                    {columnData.map((label, index) => (
                      <Table.HeaderCell width="3" key={index}>
                        {label}
                      </Table.HeaderCell>
                    ))}
                  </Table.Row>
                </Table.Header>
                <Table.Body>{rows}</Table.Body>
              </Table>
              <Container fluid>
                <Pagination
                  activePage={activePage}
                  totalPages={totalPages}
                  onPageChange={(e, rows) => this.changePage(e)}
                />
                <Dropdown
                  selection
                  floating
                  labeled
                  style={{ float: 'right' }}
                  options={pageOptions}
                  onChange={(e, obj) => this.handlePageSizeChange(e, obj)}
                  text={this.state.pageSize + ' records'}
                />
                <label
                  style={{
                    float: 'right',
                    marginTop: '10px',
                    paddingRight: '.5em',
                  }}
                >
                  Rows per page:
                </label>
              </Container>
            </div>
          );
        })}
      </div>
    );
  }

  handlePageSizeChange(e, obj) {
    const pageSize = obj.value;
    console.log(pageSize);
    this.setState({
      pageSize,
    });
  }

  changePage(e) {
    const activePage = e.target.getAttribute('value');
    this.setState({
      pages: {
        ...this.state.pages,
        [this.state.current]: activePage,
      },
    });
  }

  changeBasket(basketId) {
    this.setState({
      current: basketId,
    });

    this.refreshWorklist(basketId);
  }

  getHeaderContent() {
    if (this.props.workBaskets.length === 0) {
      return <Header.Content id="work-list">Worklist</Header.Content>;
    }

    let workBaskets = this.props.workBaskets.slice(0);
    workBaskets.unshift('Worklist');

    return (
      <Dropdown
        text={
          this.state.current === 'Worklist'
            ? this.state.current
            : /*"Workqueue for " + */ this.state.current
        }
        id="worklist-dropdown"
      >
        <Dropdown.Menu
          style={{
            height:
              workBaskets?.length > 13
                ? '500px'
                : `${workBaskets?.length * 37}px`,
            overflowY: workBaskets?.length > 13 ? 'scroll' : 'unset',
          }}
        >
          {workBaskets.map((wb, index) => {
            if (wb !== '') {
              return (
                <Dropdown.Item
                  key={index}
                  text={wb}
                  onClick={() => this.changeBasket(wb)}
                />
              );
            } else {
              return null;
            }
          })}
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  handleFilter(e) {
    let value = e.target.value;
    this.setState({
      searchText: value.toUpperCase(),
      pages: {
        Worklist: 1,
      },
    });
  }

  //<Header as="h3" textAlign="left">
  //

  render() {
    const no_border = { border: 0 };
    // Symantec-ui seems to use sizing units of 16 wide (this is why column grid widths add up to that number)
    return (
      <div>
        <Grid>
          <Grid.Column as="h3" width={4} textAlign="left">
            <Button
              basic
              color="black"
              icon
              labelPosition="left"
              size="large"
              onClick={(e) => this.getNextAssignment()}
              loading={this.state.loading}
            >
              <Icon name="plus" />
              Get Next Work
            </Button>
          </Grid.Column>
          <Grid.Column as="h3" width={8} textAlign="center">
            {this.getHeaderContent()}
          </Grid.Column>
          <Grid.Column as="h4" width={4} textAlign="right">
            <Button
              basic
              color="black"
              icon
              size="large"
              data-tooltip="Refresh list"
              data-inverted=""
              onClick={(e) => this.refreshWorklist(this.state.current)}
            >
              <Icon name="refresh" />
            </Button>
            <span style={{ paddingLeft: '1em' }} />
            <div className="ui icon input top aligned">
              <input
                type="text"
                placeholder="Search by case ID..."
                value={this.props.searchText}
                onChange={(e) => this.handleFilter(e)}
              />
              <i className="search icon" />
            </div>
          </Grid.Column>
        </Grid>
        <Segment.Group>
          <Segment
            loading={this.props.loading || this.state.loading}
            style={no_border}
          >
            {this.getWorkItemTableFromAssignments()}
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { cases, assignments } = state;
  return {
    caseTypes: cases.caseTypes,
    caseTypesError: cases.caseTypesError,
    cases: cases.cases,
    allAssignments: assignments.allAssignments,
    loading: assignments.loading,
    workBaskets: state.user.userData.workbaskets
      ? state.user.userData.workbaskets
      : [],
    workQueues: state.workqueue.workQueues,
    workList: state.workqueue.workList,
    worklistSettings: assignments.worklistSettings,
  };
}

const connectedWorklist = connect(mapStateToProps)(withRouter(Worklist));
export { connectedWorklist as Worklist };
