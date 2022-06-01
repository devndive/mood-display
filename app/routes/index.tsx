import { useLoaderData } from "@remix-run/react";
import { Fragment } from "react";
import { VictoryChart, VictoryScatter, VictoryPie, VictoryStack, VictoryArea, VictoryLabel, VictoryLine, VictoryAxis } from "victory";
import { map as _map, countBy as _countBy, filter as _filter, sortBy as _sortBy } from "lodash";

export async function loader() {
  console.time("loader");

  const response = await fetch(process.env.SENTIMENT_BACKEND);
  console.timeLog("loader", "fetch");

  const sentiment = await response.json();
  console.timeLog("loader", "json");

  _sortBy(sentiment.data, ["id"])

  const lineData = _map(sentiment.data, (d: any, idx: any) => {
    return {
      x: idx,
      y: d.sentiment.sentiment === "mixed" || d.sentiment.sentiment === "neutral" ? "neutral" : d.sentiment.sentiment,
    }
  });

  const counts = _countBy(sentiment.data, (d: any) => d.sentiment.sentiment);

  const pieData = [
    { x: "positive", y: counts.positive },
    { x: "negative", y: counts.negative },
    { x: "neutral", y: counts.neutral },
    { x: "mixed", y: counts.mixed },
  ];

  const positiveArea = _map(sentiment.data, (d: any) => {
    return {
      x: d.id,
      y: d.sentiment.confidenceScores.positive
    }
  });

  const neutral = _map(sentiment.data, (d: any) => {
    return {
      x: d.id,
      y: d.sentiment.confidenceScores.neutral
    }
  });

  const negative = _map(sentiment.data, (d: any) => {
    return {
      x: d.id,
      y: d.sentiment.confidenceScores.negative
    }
  });

  console.timeEnd("loader");

  return { data: sentiment.data, lineData, pieData, positiveArea, negative, neutral };
}

export default function Index() {
  const { data, lineData, pieData, positiveArea, negative, neutral } = useLoaderData();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Sentiment analysis of Tweets by @devndive</h1>
      <p>When my mood drops for a longer period of time it is an indicator for me to reflect and change things that make me unhappy. Some of these changes
        have been to switch jobs, do more sports, go on vacation or even do a sabatical and become a dive instructor.
      </p>
      <p>I do not tweet a lot but have had some periods of times with a tweet to summarize my day. Taking these tweets and visualizing the sentiment of them
        might give me a heads up on longer periods of not being happy.
      </p>
      <h2>Scatter plot and line chart</h2>
      <p>These plots to not really show anything I can interpret. Leaving them here since they were my first try.</p>
      <div style={{ width: "400px", display: "inline-block" }}>
        <VictoryChart
          padding={{ left: 80, top: 40, right: 40, bottom: 40 }}
        >
          <VictoryScatter
            categories={{ y: ["negative", "neutral", "positive"] }}
            data={lineData}
          />
        </VictoryChart>
      </div>
      <div style={{ width: "400px", display: "inline-block" }}>
        <VictoryChart
          padding={{ left: 80, top: 40, right: 40, bottom: 40 }}
        >
          <VictoryLine
            categories={{ y: ["negative", "neutral", "positive"] }}
            data={lineData}
          />
        </VictoryChart>
      </div>
      <h2>Pie chart</h2>
      <p>This is already a bit better and gives me an impression that most of the time my mood is at least not negative. In this plot the time factor is missing.</p>
      <div style={{ width: "400px" }}>
        <VictoryPie
          data={pieData}
          colorScale={["green", "red", "yellow", "orange"]}
          padding={{ left: 80, right: 80 }}
          labels={({ datum }) => `${datum.x}: ${datum.y}`}
        />
      </div>
      <h2>Confidence Scores of Tweets</h2>
      <div style={{ width: "800px" }}>

        <VictoryStack>
          <VictoryArea data={positiveArea} style={{ data: { fill: "green" } }} />
          <VictoryArea data={neutral} style={{ data: { fill: "yellow" } }} />
          <VictoryArea data={negative} style={{ data: { fill: "red" } }} />
          <VictoryAxis
            offsetY={40}
            label="Tweets, from youngest (left) to oldest (right)"
          />
          <VictoryAxis dependentAxis label="Confidence Scores" offsetX={40}
          />
        </VictoryStack>
      </div>

      <h2>Tweets classified as negative</h2>
      <table>
        <tbody>
          {_filter(data, (d: any) => d.sentiment.sentiment === "negative").map((d: any) => (
            <Fragment key={d.id}>
              <tr key={d.id} style={{ textAlign: "left" }}>
                <th colSpan={2} style={{ paddingTop: "20px", paddingBottom: "8px" }}>{d.text}</th>
              </tr>
              {_map(d.sentiment.sentences, (s: any) => (
                <tr key={`${d.id}-${s.offset}`}>
                  <td>{s.text}</td>
                  <td>{s.sentiment}</td>
                  <td>{s.confidenceScores.positive}</td>
                  <td>{s.confidenceScores.neutral}</td>
                  <td>{s.confidenceScores.negative}</td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
