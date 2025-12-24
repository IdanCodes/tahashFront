import React from "react";
import PrimaryButton from "../components/buttons/PrimaryButton";
import yuvalPhoto from "@assets/YuvalPorat.jpeg";

function YuvalPorat() {
  return (
    <div dir="rtl" className="mx-auto w-9/10">
      <h1 className="my-2 mb-5 text-center text-4xl font-semibold">
        יובל פורת ז״ל
      </h1>
      <div className="flex flex-row justify-between gap-4">
        <ul className="w-8/10 space-y-3 text-2xl font-[450]">
          <li>
            {
              'יובל פורת ז"ל הוא האב המייסד של התחרות השבועית, והוא ניהל במסירות את  92 התחרויות הראשונות. מעבר לתחרות השבועית יובל פורת ז"ל היה לב ליבה של הקהילה הישראלית של הקיובניג, היה עונה על כל שאלה בסבלנות ומקצועיות בתחום, דאג לשיח פעיל ורציני בקבוצות החברתיות השונות והיה משתתף פעיל בארגון תחרויות רשמיות של WCA. יובל הלך לעולמו לאחר מאבק ממושך במחלת הסרטן, בגיל 22. חסרונו של יובל כבר מורגש, ולעולם לא נשכח את תרומתו הרבה לקהילה.'
            }
          </li>
          <li>{'התחרות השבועית מוקדשת לזכרו של יובל פורת ז"ל'}</li>
        </ul>
        <div className="">
          <img
            className="m-auto w-[80%] rounded-2xl"
            src={yuvalPhoto}
            alt="תמונה של יובל פורת"
          />
        </div>
      </div>
      <div className="mx-auto my-7 size-fit">
        <a
          target="_blank"
          href="https://www.worldcubeassociation.org/persons/2017PORA02"
        >
          <PrimaryButton
            className="text-3xl font-semibold"
            content="יובל פורת ב-WCA"
          />
        </a>
      </div>
    </div>
  );
}

export default YuvalPorat;
