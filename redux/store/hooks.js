import { useDispatch, useSelector } from "react-redux";

// A wrapper for useDispatch to use throughout your app
export const useAppDispatch = () => useDispatch();

// A wrapper for useSelector to use throughout your app
export const useAppSelector = useSelector;
