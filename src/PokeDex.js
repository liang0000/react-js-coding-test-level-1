import "./App.css";
import { React, useState, useEffect, useRef } from "react";
import ReactLoading from "react-loading";
import axios from "axios";
import Modal from "react-modal";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Table } from "antd";
import Paper from "@mui/material/Paper";
import {
  Chart,
  BarSeries,
  Title,
  ArgumentAxis,
  ValueAxis,
} from "@devexpress/dx-react-chart-material-ui";
import { Animation } from "@devexpress/dx-react-chart";

function PokeDex() {
  const printRef = useRef();
  const [pokemons, setPokemons] = useState([]);
  const [pokemonDetail, setPokemonDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleDownloadPdf = async (name) => {
    const element = printRef.current;
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    const imgProperties = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

    pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${name}.pdf`);
  };

  const columns = [
    {
      key: "name",
      title: "Name",
      dataIndex: "name",
      // sorter: (a, b) => a.name < b.name,
      // sortDirections: ["descend"],
    },
    {
      key: "base_stat",
      title: "Base Stat",
      dataIndex: "base_stat",
      sorter: (a, b) => a.base_stat - b.base_stat,
      defaultSortOrder: "descend",
    },
  ];

  const fetchPokemons = async () => {
    const pokemons = await axios.get("https://pokeapi.co/api/v2/pokemon");
    setPokemons(pokemons.data);
    setIsLoading(false);
  };

  const fetchDetail = async (url) => {
    const promise = await axios.get(url);
    let data = promise.data;
    let _stats = data.stats.map((v, i) => {
      // console.log(v);
      return {
        key: i,
        base_stat: v.base_stat,
        name: v.stat.name,
      };
    });
    let detail = {
      name: data.name,
      front_default: data.sprites.front_default,
      stats: _stats,
    };
    setPokemonDetail(detail);
  };

  useEffect(() => {
    setTimeout(() => {
      fetchPokemons();
    }, 1000);
  }, []);

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      background: "black",
      color: "white",
      height: 700,
    },
    overlay: { backgroundColor: "grey" },
  };

  if (!isLoading && pokemons.length === 0) {
    return (
      <div>
        <header className="App-header">
          <h1 style={{ color: "white" }}>Welcome to pokedex !</h1>
          <h2 style={{ color: "white" }}>Requirement:</h2>
          <ul>
            <li>
              Call this api:https://pokeapi.co/api/v2/pokemon to get pokedex,
              and show a list of pokemon name.
            </li>
            <li>Implement React Loading and show it during API call</li>
            <li>
              when hover on the list item , change the item color to yellow.
            </li>
            <li>when clicked the list item, show the modal below</li>
            <li>
              Add a search bar on top of the bar for searching, search will run
              on keyup event
            </li>
            <li>Implement sorting and pagination</li>
            <li>Commit your codes after done</li>
            <li>
              If you do more than expected (E.g redesign the page / create a
              chat feature at the bottom right). it would be good.
            </li>
          </ul>
        </header>
      </div>
    );
  }

  return (
    <div>
      <header className="App-header">
        {isLoading ? (
          <>
            <div className="App">
              <header className="App-header">
                <b>Implement loader here</b>
                <ReactLoading type="spinningBubbles" />
              </header>
            </div>
          </>
        ) : (
          <>
            <h1 style={{ color: "white" }}>Welcome to pokedex !</h1>
            <b>Implement Pokedex list here</b>
            <ul>
              {pokemons.results.map((pokemon, index) => (
                <li
                  key={index}
                  className="PokeName"
                  onClick={() => {
                    fetchDetail(pokemon.url);
                  }}
                >
                  {pokemon.name}
                </li>
              ))}
            </ul>
          </>
        )}
      </header>
      {pokemonDetail && (
        <Modal
          onAfterOpen={() => {
            console.log(pokemonDetail);
          }}
          isOpen={pokemonDetail ? true : false}
          contentLabel={pokemonDetail?.name || ""}
          onRequestClose={() => {
            setPokemonDetail(null);
          }}
          style={customStyles}
          ariaHideApp={false}
        >
          <>
            <div ref={printRef}>
              <div>
                <img src={pokemonDetail.front_default} />
              </div>
              <div>
                <Table
                  columns={columns}
                  dataSource={pokemonDetail.stats}
                  showSorterTooltip={false}
                  pagination={{ defaultPageSize: 3 }}
                />
              </div>
              <div>
                <Paper>
                  <Chart data={pokemonDetail.stats}>
                    <ArgumentAxis />
                    <ValueAxis max={7} />
                    <BarSeries valueField="base_stat" argumentField="name" />
                    <Title text="Pokemons Status" />
                    <Animation />
                  </Chart>
                </Paper>
              </div>
            </div>
            <div>
              <button
                type="button"
                onClick={() => handleDownloadPdf(pokemonDetail.name)}
                style={{ color: "black" }}
              >
                Download as PDF
              </button>
            </div>
            <div>
              Requirement:
              <ul>
                <li>show the sprites front_default as the pokemon image</li>
                <li>
                  Show the stats details - only stat.name and base_stat is
                  required in tabular format
                </li>
                <li>Create a bar chart based on the stats above</li>
                <li>
                  Create a buttton to download the information generated in this
                  modal as pdf. (images and chart must be included)
                </li>
              </ul>
            </div>
          </>
        </Modal>
      )}
    </div>
  );
}

export default PokeDex;
