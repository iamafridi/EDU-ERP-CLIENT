"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { motion } from "framer-motion";
import {
  MessageSquareHeart,
  Star,
  CheckCircle2,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";
import {
  PageHeader,
  Card,
  Modal,
  FormField,
  Input,
  Select,
  Textarea,
  Button,
  Badge,
  EmptyState,
} from "@/components/ui";

export default function FeedbackPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Response form state
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");

  // Create survey state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Academic");

  const isFacultyOrAdmin =
    user?.role === "super-admin" || user?.role === "domain-admin" || user?.role === "faculty";

  const { data: surveys = [], isLoading } = useQuery({
    queryKey: ["feedbackSurveys"],
    queryFn: api.getFeedbackSurveys,
  });

  const submitResponseMutation = useMutation({
    mutationFn: api.submitFeedbackResponse,
    onSuccess: () => {
      setSuccessMsg("Your anonymous academic feedback was encrypted and registered.");
      setSelectedSurvey(null);
      setFeedbackText("");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const createSurveyMutation = useMutation({
    mutationFn: api.createFeedbackSurvey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbackSurveys"] });
      setSuccessMsg("Institutional survey instrument launched.");
      setIsCreateModalOpen(false);
      setTitle("");
      setTimeout(() => setSuccessMsg(""), 4000);
    },
  });

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    submitResponseMutation.mutate({
      surveyId: selectedSurvey?._id,
      rating,
      comments: feedbackText,
      userId: user?.id,
      submittedAt: new Date(),
    });
  };

  const handleCreateSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    createSurveyMutation.mutate({
      title,
      category,
      questions: 5,
      active: true,
      createdBy: user?.id,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Quality & Feedback"
        subtitle="Anonymous curriculum appraisal, faculty teaching evaluations, and campus amenities scorecards."
        actions={
          isFacultyOrAdmin ? (
            <Button
              variant="gold"
              size="md"
              onClick={() => setIsCreateModalOpen(true)}
              icon={<Plus size={15} />}
            >
              Launch Survey
            </Button>
          ) : undefined
        }
      />

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-lg flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Active Surveys Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="h-40 animate-pulse bg-surface-muted/30" />
          <Card className="h-40 animate-pulse bg-surface-muted/30" />
        </div>
      ) : surveys.length === 0 ? (
        <Card>
          <EmptyState
            title="No Active Surveys"
            description="There are currently no institutional evaluation surveys collecting responses."
            icon={<MessageSquareHeart size={28} className="text-gold" />}
            action={
              isFacultyOrAdmin ? (
                <Button variant="gold" onClick={() => setIsCreateModalOpen(true)} icon={<Plus size={15} />}>
                  Launch First Survey
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {surveys.map((survey: any) => (
            <Card
              key={survey._id}
              className="flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="primary" size="sm">
                    {survey.category || "Academic"}
                  </Badge>
                  <span className="text-xs text-emerald-600 flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Accepting Responses
                  </span>
                </div>

                <h3 className="text-base font-semibold text-text mb-1">
                  {survey.title}
                </h3>
                <p className="text-xs text-text-muted">
                  Standardized 5-criteria Likert scale evaluation. Submissions are cryptographically anonymized.
                </p>
              </div>

              <div className="pt-4 border-t border-border mt-4 flex items-center justify-between">
                <span className="text-xs text-text-subtle font-mono">
                  {survey.questions || 5} Evaluation Metrics
                </span>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => setSelectedSurvey(survey)}
                  icon={<Send size={13} />}
                >
                  Take Anonymous Survey
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Survey Response Modal */}
      <Modal
        isOpen={!!selectedSurvey}
        onClose={() => setSelectedSurvey(null)}
        title={selectedSurvey?.title || "Course Evaluation"}
        subtitle="Cryptographically anonymized evaluation submission"
        size="md"
      >
        {selectedSurvey && (
          <form onSubmit={handleSubmitResponse} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text mb-2">
                Overall Satisfaction Score (1 to 5 Stars)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setRating(s)}
                    className="p-2 rounded-xl border border-border hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        s <= rating ? "fill-amber-400 text-amber-400" : "text-text-subtle"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm font-semibold font-mono text-text ml-2">
                  {rating} / 5 Stars
                </span>
              </div>
            </div>

            <FormField label="Qualitative Assessment / Improvement Points" required>
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Specific remarks regarding syllabus coverage, lecture clarity, clinical demonstration, or campus facility responsiveness..."
                rows={4}
                required
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setSelectedSurvey(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitResponseMutation.isPending}
                icon={<Send size={14} />}
              >
                {submitResponseMutation.isPending ? "Transmitting..." : "Transmit Anonymous Feedback"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Create Survey Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Launch New Survey Instrument"
        subtitle="Deploy standardized appraisal questionnaire to student portals"
        size="md"
      >
        <form onSubmit={handleCreateSurvey} className="space-y-4">
          <FormField label="Survey Instrument Title" required>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. End of Term Anatomy Faculty & Lab Evaluation"
              required
            />
          </FormField>

          <FormField label="Evaluation Category" required>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Academic">Academic / Instructor Evaluation</option>
              <option value="Campus Services">Hostel Dining & Campus Logistics</option>
              <option value="Library">Library Resources & Digital Locker Access</option>
              <option value="General">General Institutional Atmosphere</option>
            </Select>
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createSurveyMutation.isPending}
              icon={<Sparkles size={14} />}
            >
              {createSurveyMutation.isPending ? "Deploying..." : "Deploy Survey Instrument"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
