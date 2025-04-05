import { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "../components/PostCard";
import { motion } from "framer-motion";
import SearchBar from "../components/SearchBar";

const Explore = () => {
  const [posts, setPosts] = useState([]); 
  const [filteredPosts, setFilteredPosts] = useState([]); // ✅ Ensure it's always an array

  useEffect(() => {
    axios.get("http://localhost:5000/api/posts")
      .then((res) => {
        console.log("✅ API Response:", res.data);
        const approvedPosts = res.data.filter(post => post.status === "approved") || [];
        setPosts(approvedPosts);
        setFilteredPosts(approvedPosts); // ✅ Persist posts on first load
      })
      .catch((err) => console.error("❌ Error fetching posts:", err));
  }, []);

  return (
    <motion.div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Explore Posts</h2>
      

      {filteredPosts.length > 0 ? (
        filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <p className="text-gray-500 text-center">🔍 No posts found. Try again.</p>
      )}
    </motion.div>
  );
};

export default Explore;
