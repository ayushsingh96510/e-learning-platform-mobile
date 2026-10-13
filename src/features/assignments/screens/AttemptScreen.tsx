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
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import QuestionCard from "../components/QuestionCard";
import QuestionPalette from "../components/QuestionPalette";
import SubmitSheet from "../components/SubmitSheet";
import { useAssessment } from "../hooks/useAssessment";
import { useSubmitAssessment } from "../hooks/useSubmitAssessment";
import type { StudentStackParamList } from "../../../navigation/StudentNavigator";

type Props = NativeStackScreenProps<StudentStackParamList, "AssignmentAttempt">;

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

  // Ask for confirmation before leaving with unsaved answers
  // (header button, Android back button, or swipe back).
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
        ]
      );
    });

    return unsubscribe;
  }, [navigation, answeredCount]);

  // Start each question at the top.
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

    const result = await submit({ assessmentId: assessment.id, answers });
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
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !assessment) {
    return (
      <View
        className="flex-1 items-center justify-center bg-gray-50 px-6"
        style={topPadding}
      >
        <Text className="text-center text-sm text-red-600">
          {error ?? "Assessment not found."}
        </Text>

        <Pressable
          onPress={reload}
          className="mt-4 rounded-xl bg-primary-600 px-6 py-3"
        >
          <Text className="font-semibold text-white">Retry</Text>
        </Pressable>

        <Pressable onPress={() => navigation.goBack()} className="mt-3 px-6 py-3">
          <Text className="font-semibold text-gray-600">Go back</Text>
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
        <Text className="text-center text-sm text-gray-500">
          This assessment has no questions yet.
        </Text>

        <Pressable
          onPress={() => navigation.goBack()}
          className="mt-4 rounded-xl bg-primary-600 px-6 py-3"
        >
          <Text className="font-semibold text-white">Go back</Text>
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
            className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-gray-100"
          >
            <Text className="text-base text-gray-700">✕</Text>
          </Pressable>

          <View className="flex-1 pr-2">
            <Text
              className="text-base font-bold text-gray-900"
              numberOfLines={1}
            >
              {assessment.title}
            </Text>
            <Text className="text-xs text-gray-500">
              Question {currentIndex + 1} of {total} · {answeredCount} answered
            </Text>
          </View>

          <Pressable
            onPress={() => setPaletteOpen(true)}
            className="rounded-full bg-primary-50 px-3 py-2"
          >
            <Text className="text-xs font-semibold text-primary-600">
              Questions
            </Text>
          </Pressable>
        </View>

        <View className="mt-3 h-2 rounded-full bg-gray-200">
          <View
            className="h-2 rounded-full bg-primary-600"
            style={{ width: `${progress}%` }}
          />
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
          className={`flex-1 items-center rounded-xl border py-3 ${
            isFirst ? "border-gray-100" : "border-gray-200"
          }`}
        >
          <Text
            className={`font-semibold ${
              isFirst ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Previous
          </Text>
        </Pressable>

        {isLast ? (
          <Pressable
            onPress={() => setSubmitOpen(true)}
            className="flex-1 items-center rounded-xl bg-primary-600 py-3"
          >
            <Text className="font-semibold text-white">Submit Paper</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => setCurrentIndex((i) => Math.min(total - 1, i + 1))}
            className="flex-1 items-center rounded-xl bg-primary-600 py-3"
          >
            <Text className="font-semibold text-white">Next</Text>
          </Pressable>
        )}
      </View>

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
