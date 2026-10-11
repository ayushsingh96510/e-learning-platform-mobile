import { useState } from "react";
import { LayoutChangeEvent, ScrollView, Text, View } from "react-native";

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
const GAP = 8;
const PADDING = 8;
const CHIP_SPACE = 36;
const COMPACT_BELOW = 200; // tiles narrower than this use the compact audio card

// Picks the column count that gives the largest 16:9 tiles inside width x height.
function bestGrid(count: number, width: number, height: number) {
  let best = { cols: 1, cellWidth: 0 };
  for (let cols = 1; cols <= Math.min(count, 4); cols++) {
    const rows = Math.ceil(count / cols);
    const byWidth = (width - GAP * (cols - 1)) / cols;
    const byHeight = ((height - GAP * (rows - 1)) / rows) * (16 / 9);
    const cellWidth = Math.floor(Math.min(byWidth, byHeight));
    if (cellWidth > best.cellWidth) best = { cols, cellWidth };
  }
  return best;
}

export default function StagePlaying() {
  const { state } = useClassRoom();
  const presenter = state.presenter;
  const { stageSeats, screenShareTracks } = usePresenterMediaState();
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

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

  // Screen share: fills the stage, seats become a thumbnail strip.
  if (screenShareTracks.length > 0) {
    return (
      <View className="h-full w-full">
        <ScreenShareStage tracks={screenShareTracks} />

        {realSeats.length > 0 && (
          <View className="absolute bottom-2 left-0 right-0">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 8, gap: 8 }}
            >
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

  const paddingTop = hasChips ? CHIP_SPACE : PADDING;
  const availableWidth = size.width - PADDING * 2;
  const availableHeight = size.height - paddingTop - PADDING;

  const ready = availableWidth > 0 && availableHeight > 0 && gridSeats.length > 0;
  const { cols, cellWidth } = ready
    ? bestGrid(gridSeats.length, availableWidth, availableHeight)
    : { cols: 1, cellWidth: 0 };
  const cellHeight = Math.round((cellWidth * 9) / 16);
  const compact = cellWidth < COMPACT_BELOW;

  return (
    <View className="h-full w-full" onLayout={onLayout}>
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
        className="flex-1 items-center justify-center"
        style={{ paddingHorizontal: PADDING, paddingTop, paddingBottom: PADDING }}
      >
        {cellWidth > 0 && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: GAP,
              width: cols * cellWidth + GAP * (cols - 1),
            }}
          >
            {gridSeats.map((seat) => (
              <View
                key={seat.identity ?? "teacher-placeholder"}
                style={{ width: cellWidth, height: cellHeight }}
              >
                {seat.isTeacherPlaceholder ? (
                  <TeacherWaitingTile
                    name={seat.name}
                    profileImage={seat.profileImage}
                    compact={compact}
                  />
                ) : (
                  renderSeat(seat, compact)
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}