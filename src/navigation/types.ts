
import type { NavigatorScreenParams } from "@react-navigation/native";

import type { AssessmentResult } from "@/features/assignments/types";
import type { JoinRoomData } from "@/features/group-study/types";

export type StudentTabParamList = {
  Home: undefined;
  LiveClasses: undefined;
  GroupStudy: undefined;
  Assignments: undefined;
  Content: undefined;
};

export type StudentStackParamList = {
  MainTabs: NavigatorScreenParams<StudentTabParamList>;
  Profile: undefined;
  ClassRoom: {
    roomName: string;
  };
  AssignmentAttempt: {
    assessmentId: string;
  };
  AssignmentResult: {
    resultId?: string;
    result?: AssessmentResult;
  };
  MaterialDetail: {
    materialId: string;
  };
  GroupStudyRoom: {
    roomName: string;
    joinData?: JoinRoomData;
  };
};
