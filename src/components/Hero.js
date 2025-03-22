import React, { useState } from 'react';
import './Hero.css';

// Ícones (ajuste o caminho conforme sua estrutura)
import editarIcon from '../assets/editar.png';
import deleteIcon from '../assets/delete.png';
import adicionaIcon from '../assets/adiciona.png';

function Hero() {
  // Número de pessoas por time (ex.: 6)
  const [pessoasPorTime, setPessoasPorTime] = useState(6);

  // Lista de categorias
  const [categorias, setCategorias] = useState([
    { id: 1, nome: 'Categoria 1', nomes: [] }
  ]);

  // Armazena o resultado dos times após gerar
  const [times, setTimes] = useState([]);

  // Adiciona nova categoria
  function adicionarCategoria() {
    const novaCategoria = {
      id: Date.now(),
      nome: 'Nova Categoria',
      nomes: []
    };
    setCategorias([...categorias, novaCategoria]);
  }

  // Remove categoria (somente se houver mais de uma)
  function removerCategoria(id) {
    if (categorias.length === 1) {
      alert('Não é possível remover a última categoria!');
      return;
    }
    setCategorias(categorias.filter(cat => cat.id !== id));
  }

  // Renomeia categoria
  function renomearCategoria(id, novoNome) {
    setCategorias(categorias.map(cat => {
      if (cat.id === id) return { ...cat, nome: novoNome };
      return cat;
    }));
  }

  // Prompt para renomear
  function handleEditarCategoria(id) {
    const novoNome = prompt('Digite o novo nome da categoria:');
    if (novoNome) {
      renomearCategoria(id, novoNome);
    }
  }

  // Atualiza lista de nomes no textarea
  function handleNomesChange(id, texto) {
    const linhas = texto.split('\n'); // Mantém quebras de linha
    setCategorias(categorias.map(cat => {
      if (cat.id === id) {
        return { ...cat, nomes: linhas };
      }
      return cat;
    }));
  }

  // Embaralha um array (Fisher-Yates)
  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Gera as equipes usando round-robin por categoria
  function gerarEquipes() {
    // 1. Reúne todos os jogadores para saber quantos times teremos
    let totalJogadores = 0;
    categorias.forEach(cat => {
      cat.nomes.forEach(nome => {
        if (nome.trim() !== '') {
          totalJogadores++;
        }
      });
    });

    // 2. Calcula quantos times existem (por ex.: 21 jogadores, 6 por time → 4 times)
    const numTimes = Math.ceil(totalJogadores / pessoasPorTime);

    // 3. Cria um array de times vazios
    const teams = [];
    for (let i = 0; i < numTimes; i++) {
      teams.push([]); // cada time é um array de nomes
    }

    // 4. Para cada categoria, embaralha e distribui seus jogadores em round-robin
    let currentTeamIndex = 0;
    categorias.forEach(cat => {
      // Filtra nomes válidos e embaralha
      const catPlayers = shuffleArray(
        cat.nomes
          .map(nome => nome.trim())
          .filter(nome => nome !== '')
      );

      // Aloca cada jogador no próximo time que não esteja cheio
      catPlayers.forEach(player => {
        // Se todos os times estiverem cheios, não aloca mais (ou poderia alocar no último time)
        let attempts = 0;
        while (teams[currentTeamIndex].length >= pessoasPorTime && attempts < numTimes) {
          currentTeamIndex = (currentTeamIndex + 1) % numTimes;
          attempts++;
        }

        // Se ainda houver espaço em algum time, aloca
        if (teams[currentTeamIndex].length < pessoasPorTime) {
          teams[currentTeamIndex].push(player);
          // Passa para o próximo time
          currentTeamIndex = (currentTeamIndex + 1) % numTimes;
        }
      });
    });

    setTimes(teams);
  }

  return (
    <section className="hero-section">
      <h1 className="hero-title">Criador de Equipes &amp; Grupos</h1>
      <p className="hero-subtitle">
        Crie equipes aleatórias automaticamente a partir de uma lista de nomes
      </p>

      {/* Campo: "Pessoas por time" */}
      <div className="input-row">
        <label htmlFor="pessoasPorTime">Pessoas por time:</label>
        <input
          id="pessoasPorTime"
          type="number"
          value={pessoasPorTime}
          onChange={(e) => setPessoasPorTime(Number(e.target.value))}
        />
      </div>

      {/* Área cinza central */}
      <div className="categories-container">
        <h2 className="insert-names-btn">Insira a lista de nomes</h2>

        {/* Caixa que exibe as categorias */}
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
                placeholder="Ex: Guilherme&#10;Antonio&#10;Jedi&#10;Leo"
                value={cat.nomes.join('\n')}
                onChange={(e) => handleNomesChange(cat.id, e.target.value)}
              />
            </div>
          ))}
          {/* Botão flutuante para adicionar categoria */}
          <button className="add-category-btn" onClick={adicionarCategoria}>
            <img src={adicionaIcon} alt="Adicionar" />
          </button>
        </div>
      </div>

      {/* Botão para gerar as equipes */}
      <button className="generate-btn" onClick={gerarEquipes}>
        Gerar Equipes
      </button>

      {/* Exibe os times (Time 1, Time 2, etc.) */}
      {times.length > 0 && (
        <div className="teams-section">
          <h2>Equipes:</h2>
          <div className="teams-wrapper">
            {times.map((time, index) => (
              <div
                key={index}
                className={`team-box ${index % 2 === 0 ? 'team-dark' : 'team-light'}`}
              >
                <h3>Time {index + 1}</h3>
                {time.map((jogador, idx) => (
                  <p key={idx}>{jogador}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default Hero;
