import Image from "next/image";
import StockDashboard from "./SP500-Prediction/StockDashboard";
import WorkDescription from "./GeneralComponents/WorkDescription";
import Sidebar from "./SideBar/SideBar";

export default function Home() {
  return (<>
    <div className="flex">

      <Sidebar />
      <main className="ml-64 flex-1">
        <StockDashboard />
        <WorkDescription
          pdfUrl="./reports/Relatorio_ML_Sinais_Financeiros_SP500.pdf"
          pdfLabel="Baixar Relatório em PDF"
        >
          <div className="py-5 text-slate-700 leading-relaxed">
            <h1 className="text-3xl text-center font-bold mb-6 border-b border-slate-200 pb-5">
              Proposta Técnica: Inteligência de Sinais em Séries Temporais Financeiras
            </h1>

            <h2 className="text-xl font-semibold mt-8 mb-3">
              Visão Geral — Executive Summary
            </h2>

            <p className="text-base text-slate-700">
              Este projeto propõe o desenvolvimento de uma
              <strong className="font-semibold">pipeline de Machine Learning end-to-end</strong>
              para a extração de tendências estruturais em ativos do
              <strong className="font-semibold">S&amp;P 500</strong>.
              A abordagem diferencia-se ao tratar o preço não como uma variável isolada,
              mas como um <strong className="font-semibold">sinal composto</strong> por uma componente
              de tendência (drift) e uma componente de ruído (estocástica / sentimento).
            </p>

            <h2 className="text-xl font-semibold mt-10 mb-4">
              Arquitetura da Solução e Workflow de MLOps
            </h2>

            <div className="bg-slate-50 border-l-4 border-blue-600 rounded-md p-5 mb-6">
              <h3 className="text-lg font-semibold mb-3">
                Fase I — Ingestão e Processamento de Sinais (Data Engineering)
              </h3>

              <p className="mb-3">
                <strong>Data Ingestion:</strong> Consumo de dados OHLCV via APIs financeiras
                (ex.: Yahoo Finance, Alpha Vantage).
              </p>

              <p className="mb-2">
                <strong>Signal Decomposition:</strong> Aplicação de filtros avançados
                (Kalman, Wavelets ou HP Filter) para decompor o preço em:
              </p>

              <ul className="list-disc list-inside ml-2 mb-3">
                <li>
                  <span className="font-mono bg-slate-200 px-1 rounded">
                    S<sub>t</sub>
                  </span>
                  — Tendência estrutural latente
                </li>
                <li>
                  <span className="font-mono bg-slate-200 px-1 rounded">
                    ε<sub>t</sub>
                  </span>
                  — Resíduo associado à volatilidade e sentimento de curto prazo
                </li>
              </ul>

              <p>
                <strong>Feature Engineering:</strong> Extração de indicadores técnicos clássicos.
                Cálculo de níveis dinâmicos de suporte e resistência via algoritmos de clustering.
                Engenharia de atributos sobre o ruído (ex.: entropia e desvio padrão móvel).
              </p>
            </div>

            <div className="bg-slate-50 border-l-4 border-blue-600 rounded-md p-5 mb-6">
              <h3 className="text-lg font-semibold mb-3">
                Fase II — Modelagem e Experimentação (Machine Learning)
              </h3>

              <p className="mb-2">
                <strong>Task Definition:</strong> Classificação multiclasse
                (Alta, Baixa, Lateral) com foco em estimativa probabilística.
              </p>

              <p className="mb-2">
                <strong>Model Selection:</strong> Implementação de modelos de Gradient Boosting
                (XGBoost / LightGBM) ou arquiteturas de Deep Learning temporal
                (LSTM / Temporal Fusion Transformer).
              </p>

              <p>
                <strong>Backtesting Framework:</strong> Avaliação rigorosa utilizando métricas
                de precisão, revocação e Log Loss, penalizando incertezas incorretas.
              </p>
            </div>

            <div className="bg-slate-50 border-l-4 border-blue-600 rounded-md p-5 mb-6">
              <h3 className="text-lg font-semibold mb-3">
                Fase III — Pipeline de Operação (Continuous Training)
              </h3>

              <p className="mb-2">
                <strong>Walk-Forward Validation:</strong> Estratégia de validação cronológica
                onde o modelo é testado no dia
                <span className="font-mono bg-slate-200 px-1 rounded">t+1</span>
                e reentrenado no dia
                <span className="font-mono bg-slate-200 px-1 rounded">t+2</span>,
                incorporando o novo dado.
              </p>

              <p className="mb-2">
                <strong>Model Registry &amp; Versioning:</strong> Exportação e versionamento
                dos artefatos do modelo (pesos e scalers) para garantir reprodutibilidade.
              </p>

              <p>
                <strong>Inference API:</strong> Disponibilização de um endpoint
                (FastAPI / Flask) para processamento de novos dados e inferência
                da tendência em tempo real.
              </p>
            </div>

            <div className="bg-slate-50 border-l-4 border-blue-600 rounded-md p-5 mb-10">
              <h3 className="text-lg font-semibold mb-3">
                Fase IV — Entrega e Observabilidade (Frontend)
              </h3>

              <p className="mb-2">
                <strong>Professional Dashboard:</strong> Visualização avançada integrando
                gráfico de preços, sobreposição da tendência extraída e mapas de calor
                probabilísticos.
              </p>

              <p>
                <strong>Performance Monitoring:</strong> Monitorização de Data Drift para
                identificar alterações estruturais no ruído de mercado que exijam
                reajuste de hiperparâmetros.
              </p>
            </div>

            <blockquote className="bg-yellow-50 border-l-4 border-yellow-400 p-4 italic text-slate-700 rounded">
              Nota Académica: Este projeto constitui uma Prova de Conceito (PoC).
              Embora utilize técnicas modernas de MLOps, o seu objetivo é a análise
              estatística de tendências e não a garantia de retornos financeiros.
              O risco e a incerteza são componentes inerentes ao modelo.
            </blockquote>

            <footer className="mt-10 text-center text-sm text-slate-500">
              © Proposta Técnica — Inteligência Artificial Aplicada a Mercados Financeiros
            </footer>

          </div>
        </WorkDescription>
      </main>

    </div>
  </>);
}
