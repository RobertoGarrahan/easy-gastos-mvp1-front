const API = "http://127.0.0.1:5000";

//navegar entre as abas
function navegar(aba) {
  document
    .querySelectorAll(".secao")
    .forEach((sec) => (sec.style.display = "none"));
  document.getElementById(aba).style.display = "block";

  if (aba === "listar") listarGastos();
  if (aba === "home") carregarDashboard();
  if (aba === "cartoes") listarCartoes();
}

//formatar data para mostrar no front
function formatarDataBR(dataISO) {
  if (!dataISO) return "—";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

//dashboard home
async function carregarDashboard() {
  const res = await fetch(`${API}/listar_gastos`);
  const gastos = await res.json();

  if (!Array.isArray(gastos)) return;

  let categorias = {};
  let meios = {};
  let cartoes = {};

  let totalMesAtual = 0;
  let totalMesAnterior = 0;

  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  const mesAnterior = mesAtual === 1 ? 12 : mesAtual - 1;
  const anoAnterior = mesAtual === 1 ? anoAtual - 1 : anoAtual;

  gastos.forEach((g) => {
    categorias[g.categoria] = (categorias[g.categoria] || 0) + 1;
    meios[g.tipo_pagamento] = (meios[g.tipo_pagamento] || 0) + 1;

    if (g.tipo_pagamento === "cartao" && g.cartao_nome) {
      cartoes[g.cartao_nome] = (cartoes[g.cartao_nome] || 0) + 1;
    }

    const d = new Date(g.data);
    const mes = d.getMonth() + 1;
    const ano = d.getFullYear();

    if (mes === mesAtual && ano === anoAtual) totalMesAtual += g.valor;
    if (mes === mesAnterior && ano === anoAnterior) totalMesAnterior += g.valor;
  });

  document.getElementById("dashMesAtual").querySelector("p").innerText =
    "R$ " + totalMesAtual.toFixed(2);

  document.getElementById("dashMesAnterior").querySelector("p").innerText =
    "R$ " + totalMesAnterior.toFixed(2);

  document.getElementById("dashQtd").querySelector("p").innerText =
    gastos.length + " registros";

  let meioMais = Object.entries(meios).sort((a, b) => b[1] - a[1])[0];
  document.getElementById("dashMeioPagamento").querySelector("p").innerText =
    meioMais ? meioMais[0] : "—";

  let cartaoMais = Object.entries(cartoes).sort((a, b) => b[1] - a[1])[0];
  document.getElementById("dashCartao").querySelector("p").innerText =
    cartaoMais ? cartaoMais[0] : "—";

  let catMais = Object.entries(categorias).sort((a, b) => b[1] - a[1])[0];
  document.getElementById("dashCategoria").querySelector("p").innerText =
    catMais ? catMais[0] : "—";
}

//grafico dashboard
let graficoCategorias;

async function carregarDashboard() {
  const res = await fetch(`${API}/listar_gastos`);
  const gastos = await res.json();
  if (!Array.isArray(gastos)) return;

  let categorias = {};
  let meios = {};
  let cartoes = {};

  let totalMesAtual = 0;
  let totalMesAnterior = 0;

  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  const mesAnterior = mesAtual === 1 ? 12 : mesAtual - 1;
  const anoAnterior = mesAtual === 1 ? anoAtual - 1 : anoAtual;

  gastos.forEach((g) => {
    categorias[g.categoria] = (categorias[g.categoria] || 0) + 1;
    meios[g.tipo_pagamento] = (meios[g.tipo_pagamento] || 0) + 1;

    if (g.tipo_pagamento === "cartao" && g.cartao_nome) {
      cartoes[g.cartao_nome] = (cartoes[g.cartao_nome] || 0) + 1;
    }

    const d = new Date(g.data);
    const mes = d.getMonth() + 1;
    const ano = d.getFullYear();

    if (mes === mesAtual && ano === anoAtual) totalMesAtual += g.valor;
    if (mes === mesAnterior && ano === anoAnterior) totalMesAnterior += g.valor;
  });

  document.getElementById("dashMesAtual").querySelector("p").innerText =
    "R$ " + totalMesAtual.toFixed(2);

  document.getElementById("dashMesAnterior").querySelector("p").innerText =
    "R$ " + totalMesAnterior.toFixed(2);

  document.getElementById("dashQtd").querySelector("p").innerText =
    gastos.length + " registros";

  let meioMais = Object.entries(meios).sort((a, b) => b[1] - a[1])[0];
  document.getElementById("dashMeioPagamento").querySelector("p").innerText =
    meioMais ? meioMais[0] : "—";

  let cartaoMais = Object.entries(cartoes).sort((a, b) => b[1] - a[1])[0];
  document.getElementById("dashCartao").querySelector("p").innerText =
    cartaoMais ? cartaoMais[0] : "—";

  let catMais = Object.entries(categorias).sort((a, b) => b[1] - a[1])[0];
  document.getElementById("dashCategoria").querySelector("p").innerText =
    catMais ? catMais[0] : "—";

  const ctx = document.getElementById("graficoCategorias").getContext("2d");

  const labels = Object.keys(categorias);
  const data = Object.values(categorias);

  if (graficoCategorias) {
    graficoCategorias.data.labels = labels;
    graficoCategorias.data.datasets[0].data = data;
    graficoCategorias.update();
  } else {
    graficoCategorias = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Gastos por Categoria",
            data: data,
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 12,
              font: {
                size: 11,
              },
            },
          },
        },
      },
    });
  }
}

//cadastrar cartões
document.getElementById("formCartao")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const cartao = {
    nome: document.getElementById("nomeCartao").value,
    limite: parseFloat(document.getElementById("limiteCartao").value),
    dia_fechamento: parseInt(document.getElementById("fechamentoCartao").value),
    dia_vencimento: parseInt(document.getElementById("vencimentoCartao").value),
  };

  const res = await fetch(`${API}/cadastrar_cartao`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cartao),
  });

  const data = await res.json();
  document.getElementById("msgCartao").innerText = data.mensagem;

  document.getElementById("formCartao").reset();
  carregarCartoesNoSelect();
  listarCartoes();
});

//listar cartões
async function listarCartoes() {
  const res = await fetch(`${API}/listar_cartoes`);
  const cartoes = await res.json();

  const div = document.getElementById("listaCartoes");
  if (!div) return;

  div.innerHTML = "";

  cartoes.forEach((c) => {
    const card = document.createElement("div");
    card.className = "card cartao-card";

    card.innerHTML = `
      <div class="cartao-info">
        <h3>${c.nome}</h3>
        <p>Limite: R$ ${c.limite.toFixed(2)}</p>
        <p>Fechamento: Dia ${c.dia_fechamento}</p>
        <p>Vencimento: Dia ${c.dia_vencimento}</p>
      </div>

      <button class="btn-del-cartao" onclick="deletarCartao(${c.id})">
        Excluir
      </button>
    `;

    div.appendChild(card);
  });
}

async function carregarCartoesNoSelect() {
  const res = await fetch(`${API}/listar_cartoes`);
  const cartoes = await res.json();

  const select = document.getElementById("cartao_id");
  if (!select) return;

  select.innerHTML = "<option value=''>Selecione</option>";
  cartoes.forEach((c) => {
    select.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
  });
}

//listar cartões cadastrados no modal de gastos
async function carregarCartoesParaModal() {
  const res = await fetch(`${API}/listar_cartoes`);
  const cartoes = await res.json();

  const select = document.getElementById("cartaoIDModal");
  select.innerHTML = "";

  cartoes.forEach((c) => {
    select.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
  });
}

//atualização dinamica em compras com cartão
function atualizarTipoPagamentoModal() {
  const tipo = document.getElementById("tipoPagamentoModal").value;
  document.getElementById("cartaoCamposModal").style.display =
    tipo === "cartao" ? "block" : "none";
}

function modParcelasModal() {
  const tipo = document.getElementById("tipoCartaoModal").value;
  document.getElementById("parcelasCamposModal").style.display =
    tipo === "credito" ? "block" : "none";
}

function mostrarParcelasModal() {
  const parc = document.getElementById("parceladoModal").value;
  document.getElementById("qtdParcelasModal").style.display =
    parc === "1" ? "block" : "none";
}

//deletar cartões
async function deletarCartao(id) {
  if (!confirm("Tem certeza que deseja excluir este cartão?")) return;

  await fetch(`${API}/deletar_cartao/${id}`, { method: "DELETE" });

  listarCartoes();
  carregarCartoesNoSelect();
}

//abrir e fechar modal de gastos
function abrirModalGasto() {
  document.getElementById("modalGasto").style.display = "flex";
  carregarCartoesParaModal();
}

function fecharModalGasto() {
  document.getElementById("modalGasto").style.display = "none";
}

//filtro de pesquisa na tabela de gastos
function filtrarTabela() {
  const termo = document.getElementById("filtroGastos").value.toLowerCase();
  const linhas = document.querySelectorAll("#listaGastos tr");

  linhas.forEach((tr) => {
    tr.style.display = tr.innerText.toLowerCase().includes(termo) ? "" : "none";
  });
}

//cadastrar gastos
document
  .getElementById("formGastoModal")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      valorModal: parseFloat(document.getElementById("valorModal").value),
      descricaoModal: document.getElementById("descricaoModal").value,
      categoriaModal: document.getElementById("categoriaModal").value,
      dataModal: document.getElementById("dataModal").value,
      tipoPagamentoModal: document.getElementById("tipoPagamentoModal").value,
      cartaoIDModal: document.getElementById("cartaoIDModal").value,
      tipoCartaoModal: document.getElementById("tipoCartaoModal").value,
      parceladoModal: document.getElementById("parceladoModal").value,
      numParcelasModal: document.getElementById("numParcelasModal").value,
      parcelaAtualModal: document.getElementById("parcelaAtualModal").value,
    };

    const res = await fetch(`${API}/cadastrar_gasto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    document.getElementById("msgAddModal").innerText = data.mensagem;

    e.target.reset();
    fecharModalGasto();
    listarGastos();
  });

//fechar modal de adicionar gasto quando clicar fora do modal
document.getElementById("modalGasto").addEventListener("click", (e) => {
  if (e.target.id === "modalGasto") {
    fecharModalGasto();
  }
});

//listar gastos
async function listarGastos() {
  const res = await fetch(`${API}/listar_gastos`);
  const gastos = await res.json();

  const tbody = document.getElementById("listaGastos");
  tbody.innerHTML = "";

  gastos.forEach((g) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>R$ ${g.valor.toFixed(2)}</td>
      <td>${g.descricao}</td>
      <td>${g.categoria}</td>
      <td>${g.tipo_pagamento}</td>
      <td>${g.cartao_nome || "—"}</td>
      <td>${formatarDataBR(g.data)}</td>
      <td><button onclick="deletarGasto(${
        g.id
      })" class="btn-del-cartao">Excluir</button></td>
    `;

    tbody.appendChild(tr);
  });
}

//apagar gastos
async function deletarGasto(id) {
  if (!confirm("Tem certeza que deseja excluir este gasto?")) return;

  const res = await fetch(`${API}/deletar_gasto/${id}`, {
    method: "DELETE",
  });

  const data = await res.json();
  alert(data.mensagem);

  listarGastos();
  carregarDashboard();
}
