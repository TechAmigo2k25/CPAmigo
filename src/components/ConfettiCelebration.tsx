import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfettiCelebrationProps {
  isVisible: boolean;
  onClose: () => void;
}

const confettiColors = [
  "hsl(160, 84%, 39%)", // green
  "hsl(217, 91%, 60%)", // blue
  "hsl(38, 92%, 50%)",  // yellow
  "hsl(280, 87%, 65%)", // purple
  "hsl(0, 84%, 60%)",   // red
];

const ConfettiPiece = ({ delay, color }: { delay: number; color: string }) => {
  const randomX = Math.random() * 100;
  const randomRotation = Math.random() * 360;
  const duration = 2 + Math.random() * 2;
  const size = 8 + Math.random() * 8;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${randomX}%`,
        top: -20,
        width: size,
        height: size * 0.6,
        backgroundColor: color,
        borderRadius: 2,
      }}
      initial={{ y: -100, rotate: 0, opacity: 1 }}
      animate={{
        y: window.innerHeight + 100,
        rotate: randomRotation + 720,
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: "linear",
      }}
    />
  );
};

export function ConfettiCelebration({ isVisible, onClose }: ConfettiCelebrationProps) {
  const [confettiPieces, setConfettiPieces] = useState<{ id: number; color: string; delay: number }[]>([]);

  useEffect(() => {
    if (isVisible) {
      const pieces = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        delay: Math.random() * 0.5,
      }));
      setConfettiPieces(pieces);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Confetti layer */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confettiPieces.map((piece) => (
              <ConfettiPiece key={piece.id} delay={piece.delay} color={piece.color} />
            ))}
          </div>

          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="relative z-10 bg-card border border-border rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/20 mb-6"
            >
              <Trophy className="w-10 h-10 text-success" />
            </motion.div>

            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-warning" />
              <h2 className="text-2xl font-bold">Congratulations!</h2>
              <Sparkles className="w-5 h-5 text-warning" />
            </div>

            <div className="flex items-center justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <Star className="w-6 h-6 text-warning fill-warning" />
                </motion.div>
              ))}
            </div>

            <p className="text-lg text-muted-foreground mb-6">
              🎉 All test cases passed successfully!
            </p>

            <Button onClick={onClose} className="w-full">
              Continue
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
