import React from "react";
import DiabetesBlog from "../DiabetesBlog";
import Navbar from "../../../../components/Navbar";

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-[var(--cream-soft)] flex flex-col">
      <Navbar />
      <div className="pt-[48px] sm:pt-[56px] flex-1">
        <DiabetesBlog showHeader />
      </div>
    </div>
  );
};

export default BlogPage;
