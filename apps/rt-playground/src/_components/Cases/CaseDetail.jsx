import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom';
// import { WorkObject } from '../WorkObject/WorkObject';
import { WorkObject } from '../../WorkObject/WorkObject';
import { assignmentActions, caseActions } from '../../_actions';
import { Loader, Dimmer } from 'semantic-ui-react';

function CaseDetail({ dispatch, assignmentDetails, caseDetails, pages }) {
  const { id } = useParams();
  const location = useLocation();
  const caseID = location.state;

  useEffect(() => {
    const woId = caseID;
    dispatch(assignmentActions.getAssignment(woId, id));
    dispatch(assignmentActions.addOpenAssignment(woId, caseID, id));
    dispatch(caseActions.getCase(woId, caseID));
  }, [dispatch, caseID]);

  if (!assignmentDetails[caseID] || !caseDetails[caseID]) {
    return (
      <Dimmer active inverted>
        <Loader />
      </Dimmer>
    );
  }

  return (
    <div>
      <h1>Case Details for {caseID}</h1>
      <WorkObject
        assignment={assignmentDetails[caseID]}
        caseID={caseID}
        case={caseDetails[caseID]}
        page={pages[caseID]}
      />
    </div>
  );
}

function mapStateToProps(state) {
  return {
    assignmentDetails: state.assignments.assignmentDetails,
    caseDetails: state.cases.caseDetails,
    pages: state.cases.pages,
  };
}

export default connect(mapStateToProps)(CaseDetail);
