import React from "react";
import DiabetesBlog from "../DiabetesBlog";
import Navbar from "../../../../components/Navbar";

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-[var(--cream-soft)]">
      <Navbar />
      <div className="pt-[76px]">
        <DiabetesBlog showHeader />
      </div>
    </div>
  );
};

export default BlogPage;
