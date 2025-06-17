// Example usage of optimistic task completion
import { useDispatch } from "react-redux";
import {
  markTaskCompleted,
  markTaskCompletedOptimistic,
  revertMarkTaskCompleted,
} from "@/redux/slices/taskSlice";

const handleMarkTaskCompleted = async (task) => {
  const dispatch = useDispatch();

  // Store original state for potential revert
  const originalTask = { ...task };
  const originalStats = { ...statistics }; // if you have access to current stats

  // 1. Optimistic update - immediate UI feedback
  dispatch(markTaskCompletedOptimistic({ id: task.id }));

  try {
    // 2. API call in background
    await dispatch(markTaskCompleted(task.id)).unwrap();
    // Success - optimistic update was correct, no action needed
  } catch (error) {
    console.error("Failed to mark task as completed:", error);

    // 3. Revert optimistic update on error
    dispatch(
      revertMarkTaskCompleted({
        id: task.id,
        originalTask,
        originalStats,
      })
    );
  }
};
