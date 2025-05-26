import React, { useState } from 'react';
import './Hero.css';

import editarIcon from '../assets/editar.png';
import deleteIcon from '../assets/delete.png';
import adicionaIcon from '../assets/adiciona.png';
import compartilharIcon from '../assets/compartilhar.png';
import checkIcon from '../assets/check.png';

function Hero() {
  const [pessoasPorTime, setPessoasPorTime] = useState(6);
  const [fixoEnabled, setFixoEnabled] = useState(false);
  const [fixos, setFixos] = useState(['', '']);
  const [categorias, setCategorias] = useState([
    { id: 1, nome: 'Categoria 1', nomes: [] }
  ]);
  const [times, setTimes] = useState([]);
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

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
      setCategorias(categorias.map(c => c.id === id ? { ...c, nome: nn } : c));
    }
  }

  function handleNomesChange(id, txt) {
    const linhas = txt.split('\n');
    setCategorias(categorias.map(c => c.id === id ? { ...c, nomes: linhas } : c));
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function gerarEquipes() {
    setLoading(true);
    setTimeout(() => {
      // 1) fixos válidos
      const validFixos = fixos.map(f => f.trim()).filter(Boolean).slice(0, 2);

      // 2) pool de não-fixos
      let pool = [];
      categorias.forEach(cat =>
        cat.nomes.forEach(n => {
          const nm = n.trim();
          if (nm && !validFixos.includes(nm)) {
            pool.push({ nome: nm, catId: cat.id });
          }
        })
      );
      pool = shuffle(pool);

      // 3) total e número de times
      const totalPlayers = pool.length + validFixos.length;
      const numTimes = Math.ceil(totalPlayers / pessoasPorTime);

      // 4) inicializa times
      const teams = Array.from({ length: numTimes }, () => ({
        jogadores: [], cats: new Set()
      }));

      // 5) coloca fixos
      validFixos.forEach((f, i) => {
        if (i < teams.length) teams[i].jogadores.push(f);
      });

      // 6) preenche até penúltimo e resto no último
      for (let i = 0; i < teams.length; i++) {
        const capacity = fixoEnabled && validFixos.length === 2
          ? (i < 2
              ? pessoasPorTime
              : (i < teams.length - 1
                  ? pessoasPorTime - 1
                  : Infinity))
          : (i < teams.length - 1
              ? pessoasPorTime
              : Infinity);
        while (teams[i].jogadores.length < capacity && pool.length) {
          let idx = pool.findIndex(p => !teams[i].cats.has(p.catId));
          if (idx < 0) idx = 0;
          const p = pool.splice(idx, 1)[0];
          teams[i].jogadores.push(p.nome);
          teams[i].cats.add(p.catId);
        }
      }

      const result = teams.map(t => t.jogadores);
      setTimes(result);

      const snapshot = result
        .map((t, i) => `Time ${i + 1}: ${t.join(', ')}`)
        .join('\n');
      setHistory([{ when: new Date().toLocaleString(), text: snapshot }, ...history]);

      setLoading(false);
      setToast('Equipes geradas!');
      setTimeout(() => setToast(''), 2000);
    }, 1000);
  }

  function handleShare() {
    const txt = times
      .map((t, i) => `Time ${i + 1}: ${t.join(', ')}`)
      .join('\n\n');
    if (navigator.share) {
      navigator.share({ title: 'Equipes Sorteadas', text: txt });
    } else {
      navigator.clipboard.writeText(txt);
      setToast('Copiado para área de transferência!');
      setTimeout(() => setToast(''), 2000);
    }
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
                  className={`team-box fade-in ${
                    i % 2 === 0 ? 'team-dark' : 'team-light'
                  }`}
                >
                  <h3>Time {i + 1}</h3>
                  {t.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="share-container">
            <button className="share-btn" onClick={handleShare}>
              <img src={compartilharIcon} alt="Compartilhar" /> Compartilhar
            </button>
          </div>
        </>
      )}

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

      {(loading || toast) && (
        <div className="toast">
          {loading
            ? <span className="line-md--loading-loop"></span>
            : <img src={checkIcon} alt="OK" />
          }
          {loading ? 'Gerando equipes...' : toast}
        </div>
      )}
    </section>
  );
}

export default Hero;
