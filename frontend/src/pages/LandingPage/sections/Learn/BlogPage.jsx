import React from "react";
import DiabetesBlog from "../DiabetesBlog";
import Navbar from "../../../../components/Navbar";

const BlogPage = () => {
  return (
    <div className="learn-page pt-24">
      <Navbar />

      <DiabetesBlog showHeader={false} />
    </div>
  );
};

export default BlogPage;