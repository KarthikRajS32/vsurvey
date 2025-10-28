import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MdKeyboardArrowRight } from "react-icons/md";

const ActiveSurveys = () => {
  const [personnel, setPersonnel] = useState([
    {
      survey: "Medical Camp Details Survey",
      date: "2024-01-15",
      isSelected: false,
    },
    {
      survey: "Medical Camp Details Survey",
      date: "2024-01-14",
      isSelected: false,
    },
    {
      survey: "Medical Camp Details Survey",
      date: "2024-01-13",
      isSelected: false,
    },
  ]);

  const handleSelect = (index) => {
    const updatedPersonnel = personnel.map((person, i) => ({
      ...person,
      isSelected: i === index,
    }));
    setPersonnel(updatedPersonnel);
  };

  return (
    <div className="lg:w-96 lg:shadow-lg lg:h-screen lg:fixed lg:right-0 lg:top-0 lg:z-40 lg:bg-white lg:overflow-y-auto w-full bg-transparent">
      <div className="lg:p-6 lg:mt-20 p-4 space-y-4">
        <div className="lg:flex lg:items-center lg:justify-center hidden">
          <CardTitle className="text-xl text-black font-semibold flex justify-center py-5">
            Active Surveys
          </CardTitle>
          <div className="w-10"></div>
        </div>
        <div className="lg:hidden mb-4">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Active Surveys
          </CardTitle>
        </div>
        <CardContent className="p-0">
          <div className="space-y-3">
            {personnel.map((person, index) => (
              <div
                key={index}
                className={`p-5 border-1 border-black rounded-lg bg-white hover:bg-gray-100 transition-colors ${person.isSelected ? "bg-blue-50" : ""}`}
                onClick={() => handleSelect(index)}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <h4 className="font-bold text-gray-800 text-sm sm:text-[13px] break-words flex-1 mb-2">
                    {person.survey}
                  </h4>
                  <button className="text-[25px]">
                    <MdKeyboardArrowRight />
                  </button>
                </div>
                <p className="text-xs text-black">Created: {person.date}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </div>
    </div>
  );
};
export default ActiveSurveys;
