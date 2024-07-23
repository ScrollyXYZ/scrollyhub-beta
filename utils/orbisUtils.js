// utils/orbisUtils.js

export async function createOrbisPost(content) {
  const { $orbis } = useNuxtApp();

  try {
    const res = await $orbis.createPost(content);
    if (res.status === 200) {
      console.log("Post created successfully");
      return { success: true };
    } else {
      console.error("Error creating post", res);
      return { success: false, error: res };
    }
  } catch (error) {
    console.error("Error creating post:", error);
    return { success: false, error };
  }
}
