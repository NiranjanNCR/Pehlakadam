import { Routes, Route } from "react-router-dom";
import Program68 from "../Program68";
import Program910 from "../Program910";
import Program1112 from "../Program1112";
import ProgramGraduate from "../ProgramGraduate";
import ProgramKudos from "../ProgramKudos";
import ProgramGeneralist from "../ProgramGeneralist";

export default function Programs() {
  return (
    <Routes>
      <Route path="program1" element={<Program68 />} />
      <Route path="program2" element={<Program910 />} />
      <Route path="program3" element={<Program1112 />} />
      <Route path="program4" element={<ProgramGraduate />} />
      <Route path="program5" element={<ProgramKudos />} />
      <Route path="program6" element={<ProgramGeneralist />} />
    </Routes>
  );
}
