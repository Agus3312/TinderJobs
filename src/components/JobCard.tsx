"use client";

import { Job } from "@/types/job";
import { SwipeContainer } from "./SwipeContainer";
import { JobCardDisplay } from "./JobCardDisplay";

interface JobCardProps {
  job: Job;
  onSwipe: (direction: "left" | "right") => void;
  isTop: boolean;
}

export function JobCard({ job, onSwipe, isTop }: JobCardProps) {
  return (
    <SwipeContainer onSwipe={onSwipe} isActive={isTop}>
      <JobCardDisplay job={job} />
    </SwipeContainer>
  );
}

export default JobCard;