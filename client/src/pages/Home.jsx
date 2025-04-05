import { motion } from "framer-motion";
import PostCard from "../components/PostCard";
import { useEffect, useState } from "react";
import { getPosts } from "../services/postService";

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getPosts().then((data) => setPosts(data));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-4xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-6">Explore Posts</h1>
      {posts.length > 0 ? (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <p className="text-gray-500">No posts available.</p>
      )}
    </motion.div>
  );
}