import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import {
  X,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  CircleHelp,
  RotateCcw,
  FileCheck2,
} from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import QuestionCard from "../components/QuestionCard";
import QuestionPalette from "../components/QuestionPalette";
import SubmitSheet from "../components/SubmitSheet";
import { useAssessment } from "../hooks/useAssessment";
import { useSubmitAssessment } from "../hooks/useSubmitAssessment";
import type { StudentStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<
  StudentStackParamList,
  "AssignmentAttempt"
>;

export default function AttemptScreen({ navigation, route }: Props) {
  const { assessmentId } = route.params;
  const insets = useSafeAreaInsets();

  const { assessment, loading, error, reload } = useAssessment(assessmentId);
  const {
    submit,
    submitting,
    error: submitError,
    clearError,
  } = useSubmitAssessment();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const allowLeave = useRef(false);

  const answeredCount = Object.keys(answers).length;

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (allowLeave.current || answeredCount === 0) return;

      e.preventDefault();

      Alert.alert(
        "Leave this attempt?",
        "Your answers will be lost if you leave now.",
        [
          { text: "Stay", style: "cancel" },
          {
            text: "Leave",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ],
      );
    });

    return unsubscribe;
  }, [navigation, answeredCount]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentIndex]);

  const handleSelect = (questionId: string, value: string) => {
    setAnswers((prev) => {
      if (value.trim() === "") {
        const { [questionId]: _removed, ...rest } = prev;
        return rest;
      }

      return { ...prev, [questionId]: value };
    });
  };

  const handleSubmit = async () => {
    if (!assessment) return;

    const result = await submit({
      assessmentId: assessment.id,
      answers,
    });

    if (!result) return;

    allowLeave.current = true;
    setSubmitOpen(false);

    navigation.replace("AssignmentResult", {
      resultId: result.id || undefined,
      result,
    });
  };

  const closeSubmitSheet = () => {
    clearError();
    setSubmitOpen(false);
  };

  const topPadding = { paddingTop: insets.top + 12 };

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center bg-gray-50"
        style={topPadding}
      >
        <ActivityIndicator size="large" color="#2563FF" />
        <Text className="mt-3 text-sm text-gray-500">
          Loading assessment...
        </Text>
      </View>
    );
  }

  if (error || !assessment) {
    return (
      <View
        className="flex-1 items-center justify-center bg-gray-50 px-6"
        style={topPadding}
      >
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
          <ClipboardList size={30} color="#FF4545" />
        </View>

        <Text className="text-lg font-bold text-gray-900">
          Unable to load assessment
        </Text>

        <Text className="mt-2 text-center text-sm leading-5 text-gray-500">
          {error ?? "Assessment not found."}
        </Text>

        <Pressable
          onPress={reload}
          accessibilityRole="button"
          className="mt-5 flex-row items-center justify-center rounded-xl bg-blue-600 px-6 py-3"
        >
          <RotateCcw size={17} color="#FFFFFF" />
          <Text className="ml-2 font-semibold text-white">Try Again</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          className="mt-3 px-6 py-3"
        >
          <Text className="font-semibold text-gray-600">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const total = assessment.questions.length;

  if (total === 0) {
    return (
      <View
        className="flex-1 items-center justify-center bg-gray-50 px-6"
        style={topPadding}
      >
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
          <ClipboardList size={30} color="#2563FF" />
        </View>

        <Text className="text-lg font-bold text-gray-900">
          No questions available
        </Text>

        <Text className="mt-2 text-center text-sm text-gray-500">
          This assessment has no questions yet.
        </Text>

        <Pressable
          onPress={() => navigation.goBack()}
          className="mt-5 rounded-xl bg-blue-600 px-6 py-3"
        >
          <Text className="font-semibold text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const question = assessment.questions[currentIndex];
  const questionIds = assessment.questions.map((q) => q.id);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;
  const progress = ((currentIndex + 1) / total) * 100;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View
        className="border-b border-gray-100 bg-white px-4 pb-4"
        style={topPadding}
      >
        <View className="flex-row items-center">
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Exit assessment"
            className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-red-50"
          >
            <X size={20} color="#FF4545" strokeWidth={2.2} />
          </Pressable>

          <View className="flex-1 pr-2">
            <Text
              className="text-base font-bold text-gray-900"
              numberOfLines={1}
            >
              {assessment.title}
            </Text>

            <View className="mt-1 flex-row flex-wrap items-center">
              <Text className="text-xs text-gray-500">
                Question {currentIndex + 1} of {total}
              </Text>

              <View className="mx-2 h-1 w-1 rounded-full bg-gray-300" />

              <View className="flex-row items-center">
                <CheckCircle2 size={12} color="#059669" />
                <Text className="ml-1 text-xs font-medium text-emerald-700">
                  {answeredCount} answered
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            onPress={() => setPaletteOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Open question navigator"
            className="flex-row items-center rounded-xl bg-blue-50 px-3 py-2.5"
          >
            <CircleHelp size={16} color="#2563FF" />
            <Text className="ml-1.5 text-xs font-semibold text-blue-700">
              Questions
            </Text>
          </Pressable>
        </View>

        {/* Progress */}
        <View className="mt-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="text-xs font-medium text-gray-500">
              Assessment progress
            </Text>
            <Text className="text-xs font-bold text-blue-600">
              {Math.round(progress)}%
            </Text>
          </View>

          <View className="h-2 overflow-hidden rounded-full bg-blue-50">
            <View
              className="h-2 rounded-full bg-blue-600"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>
      </View>

      {/* Question */}
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerClassName="p-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <QuestionCard
          question={question}
          selectedAnswer={answers[question.id]}
          onSelect={(value) => handleSelect(question.id, value)}
        />
      </ScrollView>

      {/* Footer */}
      <View
        className="flex-row gap-3 border-t border-gray-100 bg-white px-4 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Pressable
          onPress={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={isFirst}
          accessibilityRole="button"
          className={`flex-1 flex-row items-center justify-center rounded-xl border py-3 ${
            isFirst
              ? "border-gray-100 bg-gray-50"
              : "border-gray-200 bg-white"
          }`}
        >
          <ChevronLeft
            size={18}
            color={isFirst ? "#D1D5DB" : "#374151"}
          />
          <Text
            className={`ml-1 font-semibold ${
              isFirst ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Previous
          </Text>
        </Pressable>

        {isLast ? (
          <Pressable
            onPress={() => setSubmitOpen(true)}
            accessibilityRole="button"
            className="flex-1 flex-row items-center justify-center rounded-xl bg-blue-600 py-3"
          >
            <FileCheck2 size={18} color="#FFFFFF" />
            <Text className="ml-2 font-semibold text-white">
              Submit Paper
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
            accessibilityRole="button"
            className="flex-1 flex-row items-center justify-center rounded-xl bg-blue-600 py-3"
          >
            <Text className="mr-1 font-semibold text-white">Next</Text>
            <ChevronRight size={18} color="#FFFFFF" />
          </Pressable>
        )}
      </View>

      {/* Question navigator */}
      <QuestionPalette
        visible={paletteOpen}
        questionIds={questionIds}
        currentIndex={currentIndex}
        answers={answers}
        onJump={(index) => {
          setCurrentIndex(index);
          setPaletteOpen(false);
        }}
        onClose={() => setPaletteOpen(false)}
      />

      {/* Submission confirmation */}
      <SubmitSheet
        visible={submitOpen}
        totalQuestions={total}
        answeredQuestions={answeredCount}
        submitting={submitting}
        error={submitError}
        onCancel={closeSubmitSheet}
        onConfirm={handleSubmit}
      />
    </KeyboardAvoidingView>
  );
}
