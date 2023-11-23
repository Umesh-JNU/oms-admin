
import React, { useContext, useEffect, useReducer, useState } from "react";
import { Store } from "../../states/store";
import { clearErrors } from "../../states/actions";
import { useNavigate } from "react-router-dom";

import { Button, Card, Form, Accordion, useAccordionButton } from "react-bootstrap";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import {
  MessageBox,
  useTitle,
  MotionDiv,
  CustomTable,
  ViewButton,
  DeleteButton,
  CustomPagination,
} from "../../components";
import reducer from "./state/reducer";
import { getAll, del, updateActive } from "./state/action";
import { toastOptions } from "../../utils/error";
import Skeleton from "react-loading-skeleton";
import EditFAQModel from "./EditFAQ";

function CustomToggle({ children, eventKey }) {
  const [isExpanded, setExpanded] = useState(false);
  const handleCollapse = useAccordionButton(eventKey, () => {
    setExpanded(!isExpanded);
  });

  return (
    <button
      className={`accordion-button ${isExpanded ? '' : 'collapsed'}`}
      type="button"
      aria-expanded={isExpanded}
      onClick={handleCollapse}
    >
      {children}
    </button>
  );
}

export default function Users() {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { token } = state;

  const [curPage, setCurPage] = useState(1);
  const [resultPerPage, setResultPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");

  const curPageHandler = (p) => setCurPage(p);

  const [modalShow, setModalShow] = useState(false);
  const [faqId, setFaqId] = useState();
  const showModelHandler = (id) => {
    console.log("faq id", { id });
    setModalShow(true);
    setFaqId(id);
  }

  const [{ loading, error, faqs, faqsCount }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: "",
    });

  const deleteFaq = async (id) => {
    await del(dispatch, token, id);
  };

  useEffect(() => {
    (async () => {
      await getAll(dispatch, token, curPage, resultPerPage, query)
    })();
  }, [token, curPage, resultPerPage, query]);

  useEffect(() => {
    if (error) {
      toast.error(error, toastOptions);
      clearErrors(dispatch);
    }
  }, [error]);

  const numOfPages = Math.ceil(faqsCount / resultPerPage);
  const skip = resultPerPage * (curPage - 1);
  // console.log("nuofPage", numOfPages, resultPerPage);
  const setNewFAQ = (id, newFAQ) => {
    console.log({ id, newFAQ });
    const idx = faqs.findIndex((x) => x._id === id);
    faqs[idx].question = newFAQ.question;
    faqs[idx].answer = newFAQ.answer;
  };

  useTitle("FAQs");
  return (
    <MotionDiv>
      {error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Card>
          <Card.Header>
            <Button
              onClick={() => {
                navigate(`/admin/faq/create`);
              }}
              type="success"
              className="btn btn-primary btn-block mt-1"
            >
              Add FAQ
            </Button>
          </Card.Header>
          <Card.Body>
            {loading
              ? <Skeleton count={5} height={35} />
              : faqs?.length > 0
                ? <Accordion defaultActiveKey="0">
                  {faqs.map(({ _id, question, answer }, i) => (
                    <Card key={_id}>
                      <Card.Header className="accordion-header">
                        <CustomToggle eventKey={i}>{question}</CustomToggle>
                        <div className="f-center card-tools" style={{ padding: "0 1.25rem", gap: "0.5rem", backgroundColor: "#e7f1ff" }}>
                          <FaEdit color="blue" onClick={() => showModelHandler(_id)} />
                          <FaTrashAlt color="red" onClick={() => deleteFaq(_id)} />
                        </div>
                      </Card.Header>
                      <Accordion.Collapse eventKey={i}>
                        <Card.Body>{answer}</Card.Body>
                      </Accordion.Collapse>
                    </Card>
                  ))}
                </Accordion>
                : <h2>No FAQ</h2>}
          </Card.Body>
          <Card.Footer>
            <div className="float-start d-flex align-items-center mt-3">
              <p className="p-bold m-0 me-3">Row No.</p>
              <Form.Group controlId="resultPerPage">
                <Form.Select
                  value={resultPerPage}
                  onChange={(e) => {
                    setResultPerPage(e.target.value);
                    setCurPage(1);
                  }}
                  aria-label="Default select example"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                </Form.Select>
              </Form.Group>
            </div>
            {numOfPages > 0 && (
              <CustomPagination
                pages={numOfPages}
                pageHandler={curPageHandler}
                curPage={curPage}
              />
            )}
          </Card.Footer>
        </Card>
      )}
      {modalShow && <EditFAQModel
        show={modalShow}
        onHide={() => setModalShow(!modalShow)}
        faqHandler={setNewFAQ}
        reload={async () => await getAll(dispatch, token, curPage, resultPerPage, query)}
        id={faqId}
      />}
      {!modalShow && <ToastContainer />}
    </MotionDiv>
  );
}
