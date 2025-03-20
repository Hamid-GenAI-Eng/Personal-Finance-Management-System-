import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import BackButton from "./backbutton";

export default function FinanceGoals({ income, totalExpenses }) {
  const [goals, setGoals] = useState([]);
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");

  const savings = income - totalExpenses; // Remaining savings

  // 📌 Function to fetch goals history from local storage
  useEffect(() => {
    const storedHistory = localStorage.getItem("userHistory");
    if (storedHistory) {
      try {
        const history = JSON.parse(storedHistory);
        setGoals(Array.isArray(history) ? history : []); // Ensure it's an array
      } catch (error) {
        console.error("Error parsing local storage data:", error);
        setGoals([]); // Reset to empty array if parsing fails
      }
    } else {
      setGoals([]); // Ensure goals is always an array
    }
  }, []);

  // 📌 Function to add a new financial goal
  const addGoal = async () => {
    if (!goalName || !goalAmount || !goalDeadline)
      return alert("Please enter all fields!");
    const user = localStorage.getItem("userEmail");
    const userID = user.split("@")[0];

    const newGoal = {
      user_id: userID,
      name: goalName,
      amount: Number(goalAmount),
      deadline: goalDeadline,
      progress: Math.min((savings / Number(goalAmount)) * 100, 100), // Percentage of goal achieved
    };

    try {
      const response = await fetch("http://localhost:5001/api/goal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newGoal),
      });

      const text = await response.text();
      const data = JSON.parse(text);
      if (response.ok) {
        setGoals((prev) => [...prev, data]);
      } else {
        alert(data.message || "Failed to add goal");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while adding the goal");
    }

    // Save new goal to local storage
    const updatedGoals = [...(Array.isArray(goals) ? goals : []), newGoal];
    localStorage.setItem("userHistory", JSON.stringify(updatedGoals));
    setGoals(updatedGoals);

    setGoalName("");
    setGoalAmount("");
    setGoalDeadline("");
  };

  // 📌 Function to download PDF of goals
  const downloadPDF = () => {
    const input = document.getElementById("goals-report");

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save("Finance_Goals_Report.pdf");
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-700 flex items-center">
          <span className="text-4xl mr-2">🎯</span> Financial Goals Tracker
        </h1>
        <BackButton />
      </div>

      {/* Input Fields for Adding Goals */}
      <div className="p-6 bg-white border border-green-100 rounded-xl shadow-lg space-y-5 transform transition-all duration-300 hover:shadow-xl">
        <h2 className="text-xl font-semibold text-green-700 border-b border-green-100 pb-3">Set a New Goal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Goal Name</label>
            <input
              type="text"
              placeholder="Goal Name (e.g., Buy a Car)"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Target Amount</label>
            <input
              type="number"
              placeholder="Target Amount ($)"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Target Date</label>
            <input
              type="date"
              value={goalDeadline}
              onChange={(e) => setGoalDeadline(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
            />
          </div>
        </div>
        <button
          onClick={addGoal}
          className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center"
        >
          <span className="mr-2">➕</span> Add Goal
        </button>
      </div>

      {/* PDF Download Button */}
      <button
        onClick={downloadPDF}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center"
      >
        <span className="mr-2">📄</span> Download Goals Report
      </button>

      {/* Goals Summary */}
      <div
        id="goals-report"
        className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 space-y-6"
      >
        <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-3">Your Financial Goals</h2>

        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <div className="w-16 h-16 mb-4 text-gray-400 flex items-center justify-center text-4xl">🎯</div>
            <p className="text-lg">You have not set any goals yet.</p>
            <p className="text-sm mt-2">Start by adding your first goal above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal, index) => (
              <div 
                key={index} 
                className="p-5 border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                style={{ borderLeftWidth: '4px', borderLeftColor: goal.progress >= 100 ? '#10b981' : '#3b82f6' }}
              >
                <h3 className="text-lg font-semibold text-gray-800">{goal.name}</h3>
                <div className="mt-4 space-y-3">
                  <p className="flex items-center text-gray-700">
                    <span className="mr-2">🎯</span> Target:
                    <span className="font-bold ml-2">${goal.amount.toLocaleString()}</span>
                  </p>
                  <p className="flex items-center text-gray-700">
                    <span className="mr-2">📅</span> Deadline:
                    <span className="font-bold ml-2">{new Date(goal.deadline).toLocaleDateString()}</span>
                  </p>
                  <p className="flex items-center text-gray-700">
                    <span className="mr-2">💰</span> Current Savings:
                    <span className="font-bold ml-2">${savings.toLocaleString()}</span>
                  </p>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        goal.progress >= 100 ? "bg-green-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Progress:</span>
                    <span
                      className={`font-bold ${
                        goal.progress >= 100 ? "text-green-600" : "text-blue-600"
                      }`}
                    >
                      {goal.progress.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}