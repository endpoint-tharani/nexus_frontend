import React from "react";
import type { Form16ResponseDto } from "../../../types";
import { Form16Header } from "./Form16Header";
import { Form16PartB } from "./Form16PartB";
import { Form16Verification } from "./Form16Verification";

interface Form16TemplateProps {
  data: Form16ResponseDto;
}

export const Form16Template: React.FC<Form16TemplateProps> = ({ data }) => {
  return (
    <div className="form16-template-root form16-print-area">
      {/* Page 1: PART A */}
      <div className="form16-a4-sheet">
        <Form16Header data={data} />
      </div>

      {/* Page 2: PART B */}
      <div className="form16-a4-sheet form16-page-break">
        <Form16PartB data={data} />
        <Form16Verification data={data} />
      </div>
    </div>
  );
};
export default Form16Template;
