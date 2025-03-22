import React, { useState } from 'react';
import './Hero.css';

// Ícones (ajuste o caminho conforme sua estrutura)
import editarIcon from '../assets/editar.png';
import deleteIcon from '../assets/delete.png';
import adicionaIcon from '../assets/adiciona.png';

function Hero() {
  // Número de pessoas por time (padrão 5, pode ajustar conforme o protótipo)
  const [pessoasPorTime, setPessoasPorTime] = useState(5);

  // Lista de categorias (cada uma tem id, nome e array de nomes)
  const [categorias, setCategorias] = useState([
    {
      id: 1,
      nome: 'Categoria 1',
      nomes: []
    }
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
      if (cat.id === id) {
        return { ...cat, nome: novoNome };
      }
      return cat;
    }));
  }

  // Dispara prompt para editar o nome da categoria
  function handleEditarCategoria(id) {
    const novoNome = prompt('Digite o novo nome da categoria:');
    if (novoNome) {
      renomearCategoria(id, novoNome);
    }
  }

  // Atualiza lista de nomes conforme o usuário digita no textarea
  function handleNomesChange(id, texto) {
    // Armazena todas as linhas, inclusive as vazias, para que o Enter funcione normalmente
    const linhas = texto.split('\n');
    setCategorias(categorias.map(cat => {
      if (cat.id === id) {
        return { ...cat, nomes: linhas };
      }
      return cat;
    }));
  }

  // Função auxiliar para embaralhar um array (Fisher-Yates)
  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Gera os times, distribuindo os jogadores de forma a tentar evitar que
  // jogadores da mesma categoria caiam no mesmo time
  function gerarEquipes() {
    // Constrói um array de jogadores com seus respectivos catId
    let players = [];
    categorias.forEach(cat => {
      cat.nomes.forEach(nome => {
        if (nome.trim() !== '') {
          players.push({ nome, catId: cat.id });
        }
      });
    });

    // Embaralha os jogadores para garantir aleatoriedade
    players = shuffleArray(players);

    // Calcula a quantidade de times
    const numTeams = Math.ceil(players.length / pessoasPorTime);
    // Inicializa os times: cada time tem um array de jogadores e um Set para as categorias já presentes
    const teams = [];
    for (let i = 0; i < numTeams; i++) {
      teams.push({ jogadores: [], categories: new Set() });
    }

    // Função para alocar um jogador no time que (preferencialmente)
    // ainda não possui um jogador da mesma categoria e que não esteja cheio
    function assignPlayerToTeam(player) {
      // Filtra os times que ainda têm vaga
      let candidates = teams.filter(team => team.jogadores.length < pessoasPorTime);
      if (candidates.length === 0) return; // se não houver vagas, sai

      // Dentre os candidatos, busca times que NÃO possuem a categoria deste jogador
      let noDup = candidates.filter(team => !team.categories.has(player.catId));
      let chosen;
      if (noDup.length > 0) {
        // Escolhe o time com menor número de jogadores dentre os que não possuem duplicata
        noDup.sort((a, b) => a.jogadores.length - b.jogadores.length);
        chosen = noDup[0];
      } else {
        // Se todos os candidatos já possuem a categoria, escolhe o com menor número de jogadores
        candidates.sort((a, b) => a.jogadores.length - b.jogadores.length);
        chosen = candidates[0];
      }
      chosen.jogadores.push(player);
      chosen.categories.add(player.catId);
    }

    // Atribui cada jogador a um time conforme a função acima
    players.forEach(player => {
      assignPlayerToTeam(player);
    });

    // Mapeia os times para apenas um array com os nomes (para exibição)
    const finalTeams = teams.map(team => team.jogadores.map(p => p.nome));
    setTimes(finalTeams);
  }

  return (
    <section className="hero-section">
      <h1 className="hero-title">Criador de Equipes &amp; Grupos</h1>
      <p className="hero-subtitle">
        Crie equipes aleatórias automaticamente e de forma gratuita a partir de uma lista de nomes
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
        <h2 className="insert-names-btn">
          Insira a lista de nomes
        </h2>

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
              <div key={index} className={`team-box ${index % 2 === 0 ? 'team-dark' : 'team-light'}`}>
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
