import React, { JSX, useMemo } from "react";
import { useActiveComp } from "../context/ActiveCompContext";
import { CompDisplayInfo } from "@shared/interfaces/comp-display-info";
import LoadingSpinner from "../components/LoadingSpinner";
import LoginButton from "../components/LoginButton";
import EventBoxes, { EventBox, EventBoxIcon } from "../components/EventBoxes";
import wcaLogo from "@assets/WCALogo.png";
import { CubingIconsSheet } from "../components/CubingIconsSheet";
import { useUserInfo } from "../context/UserContext";

function Home(): JSX.Element {
  const activeComp = useActiveComp();
  const userInfo = useUserInfo();

  /**
   * Welcome to the ILCubers weekly competition!
   * LOGO ILCubers
   * Link to ilcubers.com
   * Buttons:
   * - Log In
   * - Stats
   * - Instructions
   * -
   *
   *
   * Instructions Page:
   * In each competition you get new scrambles for each event, and you can submit times
   *
   *
   * About Page:
   *
   *
   *
   */

  return (
    <>
      <h1 className="m-3 text-center text-4xl font-bold">
        תחרות השבועית על שם יובל פורת ז"ל
      </h1>
      {activeComp.displayInfo ? (
        <div className="mx-auto mb-6 flex w-4/5 flex-col">
          <AnnouncementsBox />
          <div className="my-1.5 flex place-items-center justify-center pb-2">
            {userInfo.user ? (
              <></>
            ) : (
              <LoginButton
                content={
                  <div className="flex flex-row gap-3">
                    <img
                      src={wcaLogo}
                      alt="World Cube Association Logo"
                      width={40}
                    />
                    <span className="my-auto">התחברות</span>
                  </div>
                }
              />
            )}
          </div>
          <ActiveCompData compInfo={activeComp.displayInfo} />
        </div>
      ) : (
        <LoadingSpinner />
      )}
    </>
  );
}

function ActiveCompData({ compInfo }: { compInfo: CompDisplayInfo }) {
  const activeComp = useActiveComp();
  if (!activeComp.displayInfo) return <>Loading...</>;

  const formatDate = (date: Date) =>
    `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  const startDateString = useMemo<string>(() => {
    return formatDate(new Date(compInfo.startDate));
  }, [compInfo]);
  const endDateString = useMemo<string>(() => {
    return formatDate(new Date(compInfo.endDate));
  }, [compInfo]);

  return (
    <div className="mx-auto mb-4 w-8/10 rounded-xl bg-blue-600/40 px-4 py-3">
      <CubingIconsSheet />
      <h1 className="text-center text-2xl font-semibold">
        מידע על התחרות הנוכחית
      </h1>
      <ul className="my-2" dir="rtl" style={{ fontSize: "1.35rem" }}>
        <li>
          {"מספר תחרות: "} {compInfo.compNumber}
        </li>
        <li>
          {"התחלת התחרות:"} {startDateString}
        </li>
        <li>
          {"סיום התחרות:"} {endDateString}
        </li>
        <li>
          <div className="flex flex-wrap gap-3">
            מקצים:
            {compInfo.events.map((evDisplay) => (
              <EventBoxIcon
                key={evDisplay.eventId}
                iconName={evDisplay.iconName}
                size={"1.75rem"}
              />
            ))}
          </div>
        </li>
      </ul>
    </div>
  );
}

function AnnouncementsBox() {
  return (
    <div className="rounded-2xl pt-2">
      <h1 className="text-center text-3xl font-semibold tracking-normal">
        עדכונים והודעות חשובות
      </h1>
      <ul
        className="mt-3 mb-1 list-disc space-y-2.5 px-3"
        dir="rtl"
        style={{ fontSize: "1.35rem" }}
      >
        <li>ברוכים הבאים לתח"ש המחודש!!!</li>
        <li>
          {
            'המערכת החדשה של התח"ש היא גרסה ראשונית ובעתיד היא תעבור עוד עדכונים ושינויים.'
          }
        </li>
        <li>
          {
            'המערכת הזו מאשרת באופן אוטומטית את כל ההגשות, עם בקרה ידנית. המערכת הזו עוד בחיתוליה ואנחנו עוד לומדים אותה. במידה והגשתם איוונט מסויים ואחרי עדכון שבועי אתם לא רואים את התוצאה שלכם בדף התוצאות של אותו האיוונט, סביר להניח שהמערכת לא אישרה לכם באופן אוטומטי את התוצאה, והיא נפלה בין הכסאות בבקרה הידנית. אין מה להתרגש מזה, וננסה ליעל את המערכת כך שמקרים כאלו יקרו פחות ופחות. אין מה לשאול את מתפעלי התח"ש למה התוצאה שלכם לא מופיעה.'
          }
        </li>
        <li>
          {
            "במידה ואתם מוצאים תקלות, או שיש לכם רעיונות לשיפור או כל דבר, תהיה מערכת מסודרת בו תוכלו לכתוב לנו, ובינתיים אפשר "
          }
          <a
            href={"https://forms.gle/iGSigpAMqVs2RZRx6"}
            className="underline"
            target="_blank"
          >
            {"לכתוב כאן"}
          </a>
          .
        </li>
        <li>{"המקצים FMC ו-MBLD יתווספו בהמשך"}</li>
        <li>{"בהצלחה לכולם :)"}</li>
      </ul>
    </div>
  );
}

export default Home;
