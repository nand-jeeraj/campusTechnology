import React from "react";
import { Routes, Route } from "react-router-dom";
import AttendanceNav from "./AttendanceNav";
import UploadPage from "./attendance/UploadPage";
import History from "./attendance/History";
import Dashboard from "./attendance/Dashboard";
import AddFace from "./attendance/AddFace";

export default function AttendanceApp() {
  return (
    <Routes>
      <Route path="/attendance" element={<AttendanceNav />}>
        <Route index element={<UploadPage />} />
        <Route path="/attendance/upload" element={<UploadPage />} />
        <Route path="/attendance/history" element={<History />} />
        <Route path="/attendance/dashboard" element={<Dashboard />} />
        <Route path="/attendance/add-face" element={<AddFace />} />
      </Route>
    </Routes>
  );
}