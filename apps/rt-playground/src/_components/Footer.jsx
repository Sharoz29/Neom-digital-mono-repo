import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.div`
  width: 100%;
  height:50px;
  display:flex;
  align-items: center;
  justify-content:center;
  background-color: white;
  `;
  
  const FooterText = styled.p`
  font-weight: bolder;
  margin: 0;
  color: black;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterText>© 2024 Emergency Alarm System</FooterText>
    </FooterContainer>
  );
};

export default Footer;
