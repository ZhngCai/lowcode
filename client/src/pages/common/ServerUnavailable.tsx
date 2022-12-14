import React from "react";
import styled from "styled-components";
import PageUnavailableImage from "assets/images/404-image.png";

const Wrapper = styled.div`
  height: calc(100vh - ${(props) => props.theme.headerHeight});
  background-color: #fafafa;
  text-align: center;
  padding-top: calc(${(props) => props.theme.headerHeight} + 50px);
  .bold-text {
    font-weight: ${(props) => props.theme.fontWeights[3]};
    font-size: 24px;
  }
  .page-unavailable-img {
    width: 35%;
    margin: auto;
  }
  .button-position {
    margin: auto;
  }
`;
const RetryButton = styled.button`
  background-color: #f3672a;
  color: white;
  height: 40px;
  width: 300px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 17px;
  margin-top: 16px;
`;

function ServerUnavailable() {
  return (
    <Wrapper>
      <img
        alt="Page Unavailable"
        className="page-unavailable-img"
        src={PageUnavailableImage}
      />
      <div>
        <p className="bold-text">系统服务出了一点问题😭</p>
        <p>请稍后重试</p>
        <RetryButton onClick={() => window.location.reload()}>
          {"重试"}
        </RetryButton>
      </div>
    </Wrapper>
  );
}

export default ServerUnavailable;
