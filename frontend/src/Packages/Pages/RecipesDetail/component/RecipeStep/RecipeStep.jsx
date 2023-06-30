import React from "react";
import styled from "styled-components";
import { Image } from "antd";

const RecipeStep = ({ data, index }) => {
  return (
    <Container>
      <StepNumber>Step {index + 1}</StepNumber>
      <MethodDetail>
        <Image
          width={350}
          style={{ minWidth: 350, maxWidth: 350 }}
          src={"data:image/jpg;base64," + data?.picture}
        />
        <Description>{data?.description}</Description>
      </MethodDetail>
    </Container>
  );
};

export default RecipeStep;

const Container = styled.div`
  margin-bottom: 64px;
`;
const StepNumber = styled.div`
  font-family: "Inter";
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 36px;
  color: #b6b6b6;
  margin-bottom: 34px;
`;
const MethodDetail = styled.div`
  display: flex;
`;
const Description = styled.div`
  margin: 20px;
  font-family: "Inter";
  font-style: normal;
  font-weight: 400;
  font-size: 15px;
  line-height: 36px;
`;
