import styled from 'styled-components';
import React from 'react';
import { Worklist } from '../../Worklist/Worklist';
import { Container } from 'semantic-ui-react';

const CaseHeader = styled.div`
  padding: 20px;
  font-size: 24px;
  font-weight: bold;
`;

const Cases = () => {
  return (
    <>
      <CaseHeader>Cases</CaseHeader>
      <div style={{ padding: '0px 50px' }}>
        <Container fluid>
          <Worklist />
        </Container>
      </div>
    </>
  );
};

export default Cases;
