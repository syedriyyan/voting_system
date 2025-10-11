import { useForm } from "react-hook-form";
import { useVoting } from "@/hooks/useVoting";
import { Button } from "../ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const voteSchema = z.object({
  choice: z.string().min(1, "Please select a candidate"),
});

type VoteFormData = z.infer<typeof voteSchema>;

interface VoteFormProps {
  electionId: string;
  candidates: Array<{ id: string; name: string }>;
}

export function VoteForm({ electionId, candidates }: VoteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VoteFormData>({
    resolver: zodResolver(voteSchema),
  });

  const { vote, isVoting } = useVoting();

  const onSubmit = async (data: VoteFormData) => {
    try {
      await vote(parseInt(data.choice));
    } catch (error) {
      console.error("Error casting vote:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {candidates.map((candidate) => (
        <div key={candidate.id} className="flex items-center space-x-2">
          <input
            type="radio"
            {...register("choice")}
            value={candidate.id}
            id={candidate.id}
            className="radio"
          />
          <label htmlFor={candidate.id}>{candidate.name}</label>
        </div>
      ))}
      {errors.choice && (
        <p className="text-sm text-red-500">{errors.choice.message}</p>
      )}
      <Button type="submit" disabled={isVoting}>
        {isVoting ? "Casting Vote..." : "Cast Vote"}
      </Button>
    </form>
  );
}
