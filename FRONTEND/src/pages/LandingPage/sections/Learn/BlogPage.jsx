import React from "react";
import DiabetesBlog from "../DiabetesBlog";
import Navbar from "../../../../components/Navbar";

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-[var(--cream-soft,#F6F3EE)] flex flex-col">
      <Navbar />
      <div className="pt-20 sm:pt-24 lg:pt-28 flex-1">
        <DiabetesBlog showHeader />
      </div>
    </div>
  );
};

export default BlogPage;
