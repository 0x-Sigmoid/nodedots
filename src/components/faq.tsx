import { marketingFaq } from "@/lib/marketing-faq";
export function Faq() {
  return <section id="faq" className="clarity-section clarity-faq" aria-labelledby="faq-title"><p className="clarity-kicker">A few useful answers</p><h2 id="faq-title">FAQ</h2><div>{marketingFaq.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>;
}
