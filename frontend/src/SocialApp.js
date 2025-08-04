import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./social/Navbar"; // Navbar at top
import DiscussionBoard from "./social/DiscussionBoard";
import LandingPage from "./LandingPage";
import FacultyAnnouncements from "./social/FacultyAnnouncements";
import FacultyFeedback from "./social/FacultyFeedback";
import FacultyViewCourseRatings from "./social/FacultyViewCourseRatings";
import StudentFeedback from "./social/StudentFeedback";
import StudentMeetings from "./social/StudentMeetings";
import StudentRateCourse from "./social/StudentRateCourse";
import StudentAnnouncements from "./social/StudentsAnnouncements";
import VideoMeetings from "./social/VideoMeetings";

function SocialApp() {
  return (
    <>
      <Navbar /> {/* Always visible */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/discussions" element={<DiscussionBoard />} />
        <Route path="/faculty-announcements" element={<FacultyAnnouncements />} />
        <Route path="/feedbacks" element={<FacultyFeedback />} />
        <Route path="/view-course-ratings" element={<FacultyViewCourseRatings />} />
        <Route path="/feedback" element={<StudentFeedback />} />
        <Route path="/smeetings" element={<StudentMeetings />} />
        <Route path="/rate-course" element={<StudentRateCourse />} />
        <Route path="/Student-announcements" element={<StudentAnnouncements />} />
        <Route path="/meetings" element={<VideoMeetings />} />
      </Routes>
    </>
  );
}

export default SocialApp;
