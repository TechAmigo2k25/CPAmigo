import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

/* ============================= */
/* 1️⃣ Define Context Type       */
/* ============================= */

interface GlobalStatsContextType {
  studentCount: number;
  setStudentCount: Dispatch<SetStateAction<number>>;
  problemCount: number;
  setProblemCount: Dispatch<SetStateAction<number>>;
  solvedproblemCount: number;
  setSolvedProblemCount: Dispatch<SetStateAction<number>>;
  resetCounts: () => void;
}

/* ============================= */
/* 2️⃣ Create Context            */
/* ============================= */

const GlobalStatsContext = createContext<GlobalStatsContextType | undefined>(
  undefined
);

/* ============================= */
/* 3️⃣ Provider Component        */
/* ============================= */

interface GlobalStatsProviderProps {
  children: ReactNode;
}

export const GlobalStatsProvider = ({
  children,
}: GlobalStatsProviderProps) => {
  const [studentCount, setStudentCount] = useState<number>(0);
  const [problemCount, setProblemCount] = useState<number>(0);
  const [solvedproblemCount, setSolvedProblemCount] = useState<number>(0);

  const resetCounts = () => {
    setStudentCount(0);
    setProblemCount(0);
    setSolvedProblemCount(0);
  };

  return (
    <GlobalStatsContext.Provider
      value={{
        studentCount,
        setStudentCount,
        problemCount,
        setProblemCount,
        solvedproblemCount,
        setSolvedProblemCount,
        resetCounts,
      }}
    >
      {children}
    </GlobalStatsContext.Provider>
  );
};

/* ============================= */
/* 4️⃣ Custom Hook               */
/* ============================= */

export const useGlobalStats = (): GlobalStatsContextType => {
  const context = useContext(GlobalStatsContext);

  if (!context) {
    throw new Error(
      "useGlobalStats must be used inside GlobalStatsProvider"
    );
  }

  return context;
};