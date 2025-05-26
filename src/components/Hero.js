import React, { useState, useEffect } from 'react';
import './Hero.css';

import editarIcon from '../assets/editar.png';
import deleteIcon from '../assets/delete.png';
import adicionaIcon from '../assets/adiciona.png';
import compartilharIcon from '../assets/compartilhar.png';

function Hero() {
  // Estados principais
  const [pessoasPorTime, setPessoasPorTime] = useState(6);
  const [fixoEnabled, setFixoEnabled] = useState(false);
  const [fixos, setFixos] = useState(['', '']);
  const [categorias, setCategorias] = useState([
    { id: 1, nome: 'Categoria 1', nomes: [] }
  ]);
  const [times, setTimes] = useState([]);
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState('');

  // Helpers de categoria
  function adicionarCategoria() {
    setCategorias([
      ...categorias,
      { id: Date.now(), nome: 'Nova Categoria', nomes: [] }
    ]);
  }

  function removerCategoria(id) {
    if (categorias.length === 1) {
      alert('Não pode remover a última categoria');
      return;
    }
    setCategorias(categorias.filter(c => c.id !== id));
  }

  function handleEditarCategoria(id) {
    const nn = prompt('Novo nome:');
    if (nn) {
      setCategorias(
        categorias.map(c => (c.id === id ? { ...c, nome: nn } : c))
      );
    }
  }

  function handleNomesChange(id, txt) {
    const linhas = txt.split('\n');
    setCategorias(
      categorias.map(c => (c.id === id ? { ...c, nomes: linhas } : c))
    );
  }

  // shuffle Fisher–Yates
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Sorteio de equipes
  function gerarEquipes() {
    // 1) fixos válidos
    const validFixos = fixos
      .map(f => f.trim())
      .filter(Boolean)
      .slice(0, 2);

    // 2) pool de não-fixos com categoria
    let pool = [];
    categorias.forEach(cat => {
      cat.nomes.forEach(n => {
        const nm = n.trim();
        if (nm && !validFixos.includes(nm)) {
          pool.push({ nome: nm, catId: cat.id });
        }
      });
    });
    pool = shuffle(pool);

    // 3) contagens
    const total = pool.length + validFixos.length;
    const numTimes = Math.ceil(total / pessoasPorTime);

    // 4) slots por time
    const base = Math.floor(pool.length / numTimes);
    const extra = pool.length % numTimes;
    const slots = Array.from({ length: numTimes },
      (_, i) => base + (i < extra ? 1 : 0)
    );

    // 5) inicializa times
    const teams = Array.from({ length: numTimes }, () => ({
      jogadores: [],
      cats: new Set(),
      filled: 0
    }));

    // 6) coloca fixos nos 2 primeiros
    validFixos.forEach((f, i) => {
      if (i < teams.length) teams[i].jogadores.push(f);
    });

    // 7) aloca por categoria respeitando slots
    function assign(p) {
      const cand = teams
        .map((t, idx) => ({ t, idx }))
        .filter(o => o.t.filled < slots[o.idx]);
      if (!cand.length) return;
      const nodup = cand.filter(o => !o.t.cats.has(p.catId));
      const choice = (nodup.length ? nodup : cand)
        .sort((a, b) => a.t.filled - b.t.filled)[0];
      choice.t.jogadores.push(p.nome);
      choice.t.cats.add(p.catId);
      choice.t.filled++;
    }
    pool.forEach(assign);

    // 8) resultado
    const result = teams.map(t => t.jogadores);
    setTimes(result);

    // 9) histórico
    const snapshot = result
      .map((t, i) => `Time ${i + 1}: ${t.join(', ')}`)
      .join('\n');
    setHistory([{ when: new Date().toLocaleString(), text: snapshot }, ...history]);

    // 10) feedback
    setToast('Equipes geradas!');
    setTimeout(() => setToast(''), 2000);
  }

  // Compartilhar resultado (cópia para clipboard)
  function handleShare() {
    const txt = times
      .map((t, i) => `Time ${i + 1}: ${t.join(', ')}`)
      .join('\n\n');
    navigator.clipboard.writeText(txt);
    setToast('Resultado copiado!');
    setTimeout(() => setToast(''), 2000);
  }

  return (
    <section className="hero-section">
      <h1 className="hero-title">Criador de Equipes &amp; Grupos</h1>
      <p className="hero-subtitle">Automatize a divisão de times</p>

      <div className="input-row">
        <label>Pessoas por time:</label>
        <input
          type="number"
          value={pessoasPorTime}
          onChange={e => setPessoasPorTime(+e.target.value)}
        />
      </div>

      <div className="input-row">
        <label>
          <input
            type="checkbox"
            checked={fixoEnabled}
            onChange={() => {
              setFixoEnabled(!fixoEnabled);
              if (fixoEnabled) setFixos(['', '']);
            }}
          />{' '}
          2 Goleiros fixos?
        </label>
      </div>

      {fixoEnabled && (
        <div className="fixed-inputs">
          <input
            placeholder="Fixo 1"
            value={fixos[0]}
            onChange={e => setFixos([e.target.value, fixos[1]])}
          />
          <input
            placeholder="Fixo 2"
            value={fixos[1]}
            onChange={e => setFixos([fixos[0], e.target.value])}
          />
        </div>
      )}

      <div className="categories-container">
        <h2 className="insert-names-btn">Insira a lista de nomes</h2>
        <div className="category-box">
          {categorias.map(cat => (
            <div key={cat.id} className="category-area">
              <div className="category-header">
                <span className="category-name">{cat.nome}</span>
                <div className="category-actions">
                  <img
                    src={editarIcon}
                    alt="Editar"
                    className="icon"
                    onClick={() => handleEditarCategoria(cat.id)}
                  />
                  {categorias.length > 1 && (
                    <img
                      src={deleteIcon}
                      alt="Excluir"
                      className="icon"
                      onClick={() => removerCategoria(cat.id)}
                    />
                  )}
                </div>
              </div>
              <textarea
                rows={6}
                value={cat.nomes.join('\n')}
                onChange={e => handleNomesChange(cat.id, e.target.value)}
              />
            </div>
          ))}
          <button className="add-category-btn" onClick={adicionarCategoria}>
            <img src={adicionaIcon} alt="Adicionar" />
          </button>
        </div>
      </div>

      <button className="generate-btn" onClick={gerarEquipes}>
        Gerar Equipes
      </button>

      {times.length > 0 && (
        <>
          <div className="teams-section">
            <h2>Equipes</h2>
            <div className="teams-wrapper">
              {times.map((t, i) => (
                <div
                  key={i}
                  className={`team-box fade-in ${i % 2 === 0 ? 'team-dark' : 'team-light'}`}
                >
                  <h3>Time {i + 1}</h3>
                  {t.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Botão compartilhar */}
          <div className="share-container">
            <button className="share-btn" onClick={handleShare}>
              <img src={compartilharIcon} alt="Compartilhar" /> Compartilhar
            </button>
          </div>
        </>
      )}

      {/* Histórico */}
      {history.length > 0 && (
        <details className="history">
          <summary>Histórico de sorteios</summary>
          {history.map((h, i) => (
            <div key={i} className="history-entry">
              <strong>{h.when}</strong>
              <pre>{h.text}</pre>
            </div>
          ))}
        </details>
      )}

      {/* Toast de feedback */}
      {toast && <div className="toast">{toast}</div>}
    </section>
  );
}

export default Hero;
