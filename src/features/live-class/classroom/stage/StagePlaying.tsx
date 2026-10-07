import { ScrollView, Text, View } from "react-native";

import { useClassRoom } from "../ClassRoomContext";
import {
  usePresenterMediaState,
  type StageRole,
  type StageSeat,
} from "./usePresenterMediaState";
import ScreenShareStage from "./ScreenShareStage";
import SeatAudioCard from "./SeatAudioCard";
import TeacherWaitingTile from "./TeacherWaitingTile";
import VideoTile from "./VideoTile";

const VISIBLE_SEATS = 6;

export default function StagePlaying() {
  const { state } = useClassRoom();
  const presenter = state.presenter;
  const { stageSeats, screenShareTracks } = usePresenterMediaState();

  const teacherPlaceholder = stageSeats.find((s) => s.isTeacherPlaceholder) ?? null;
  const realSeats = stageSeats.filter((s) => !s.isTeacherPlaceholder);

  const tileTypeFor = (role: StageRole) =>
    role === "TEACHER"
      ? presenter?.type === "TEACHER"
        ? "teacher"
        : "presenter"
      : role === "ADMIN"
        ? "admin"
        : "student";

  const renderSeat = (seat: StageSeat, compact: boolean) => {
    if (seat.isCameraOn && seat.trackReference) {
      return <VideoTile trackRef={seat.trackReference} type={tileTypeFor(seat.role)} />;
    }
    return (
      <SeatAudioCard
        name={seat.name}
        role={seat.role}
        profileImage={seat.profileImage}
        isSpeaking={seat.isSpeaking}
        compact={compact}
      />
    );
  };

  // Screen share: full stage, with seats as a thumbnail strip.
  if (screenShareTracks.length > 0) {
    return (
      <View className="h-full w-full">
        <ScreenShareStage tracks={screenShareTracks} />

        {realSeats.length > 0 && (
          <View className="absolute bottom-2 left-0 right-0">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8, gap: 8 }}>
              {realSeats.map((seat) => (
                <View key={seat.identity} style={{ width: 112, aspectRatio: 16 / 9 }}>
                  {renderSeat(seat, true)}
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  }

  // The teacher placeholder is a grid cell only while the stage is quiet.
  const showTeacherCell = !teacherPlaceholder || stageSeats.length <= 4;
  const overflowCount = Math.max(0, realSeats.length - VISIBLE_SEATS);
  const hasChips = (!showTeacherCell && !!teacherPlaceholder) || overflowCount > 0;

  const gridSeats: StageSeat[] = [];
  if (showTeacherCell && teacherPlaceholder) gridSeats.push(teacherPlaceholder);
  gridSeats.push(...realSeats.slice(0, VISIBLE_SEATS));

  const seatCount = gridSeats.length;
  const cols = seatCount <= 1 ? 1 : seatCount <= 4 ? 2 : seatCount <= 6 ? 3 : 4;
  const rows = Math.max(1, Math.ceil(seatCount / cols));
  const single = seatCount === 1;

  return (
    <View className="h-full w-full">
      {hasChips && (
        <View className="absolute left-0 right-0 top-2 z-10 flex-row flex-wrap items-center justify-center gap-2 px-2">
          {!showTeacherCell && teacherPlaceholder && (
            <View className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1">
              <Text className="text-[11px] font-medium text-amber-700">
                Waiting for {teacherPlaceholder.name} …
              </Text>
            </View>
          )}
          {overflowCount > 0 && (
            <View className="rounded-full border border-slate-200 bg-white px-2 py-1">
              <Text className="text-[11px] font-medium text-slate-600">
                +{overflowCount} more on stage
              </Text>
            </View>
          )}
        </View>
      )}

      <View
        className="h-full w-full flex-row flex-wrap content-center items-center"
        style={{ padding: 8, paddingTop: hasChips ? 36 : 8 }}
      >
        {gridSeats.map((seat) => (
          <View
            key={seat.identity ?? "teacher-placeholder"}
            style={{
              width: `${100 / cols}%`,
              height: single ? "100%" : `${100 / rows}%`,
              padding: 4,
            }}
          >
            {seat.isTeacherPlaceholder ? (
              <TeacherWaitingTile
                name={seat.name}
                profileImage={seat.profileImage}
                compact={!single}
              />
            ) : (
              renderSeat(seat, !single)
            )}
          </View>
        ))}
      </View>
    </View>
  );
}