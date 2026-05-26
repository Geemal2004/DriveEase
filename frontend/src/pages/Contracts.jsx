import { useEffect, useState } from "react";
import {
  getAllContracts,
  createContract,
  updateContract,
  removeContract,
  uploadContractDocument,
} from "../services/contractService";
import { getAllProviders } from "../services/providerService";
import authService from "../services/authService";
import EmptyState from "../components/EmptyState";
import SegmentedTabs from "../components/SegmentedTabs";
import SkeletonRows from "../components/SkeletonRows";

function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [editingContractId, setEditingContractId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);

  const [formData, setFormData] = useState({
    providerId: "",
    uploadedByUserId: authService.getCurrentUser()?.id || 1,
    documentName: "",
    documentUrl: "",
    effectiveFrom: "",
    effectiveTo: "",
    status: "ACTIVE",
  });

  const loadContracts = async () => {
    setIsLoading(true);
    try {
      const data = await getAllContracts();
      setContracts(data);
    } catch {
      setError("Failed to load contracts.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadProviders = async () => {
    try {
      const data = await getAllProviders();
      setProviders(data.filter((provider) => provider.status === "ACTIVE"));
    } catch {
      setError("Failed to load providers.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === "providerId" || name === "uploadedByUserId"
        ? Number(value)
        : value,
    });
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setMessage("");
    setError("");
    setIsUploadingDocument(true);

    try {
      const uploadResult = await uploadContractDocument(file);
      setFormData((prev) => ({
        ...prev,
        documentName: uploadResult.fileName || file.name || prev.documentName,
        documentUrl: uploadResult.fileUrl,
      }));
      setMessage("Document uploaded successfully.");
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || "Failed to upload document.");
    } finally {
      setIsUploadingDocument(false);
      e.target.value = "";
    }
  };

  const resetForm = () => {
    setFormData({
      providerId: "",
      uploadedByUserId: authService.getCurrentUser()?.id || 1,
      documentName: "",
      documentUrl: "",
      effectiveFrom: "",
      effectiveTo: "",
      status: "ACTIVE",
    });

    setEditingContractId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!editingContractId && !formData.documentUrl) {
      setError("Please upload a contract PDF before saving.");
      return;
    }

    const payload = {
      ...formData,
      providerId: Number(formData.providerId),
      uploadedByUserId: Number(formData.uploadedByUserId),
      effectiveTo: formData.effectiveTo || null,
    };

    try {
      if (editingContractId) {
        await updateContract(editingContractId, payload);
        setMessage("Contract updated successfully.");
      } else {
        await createContract(payload);
        setMessage("Contract created successfully.");
      }

      resetForm();
      setActiveTab("list");
      void loadContracts();
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || "Failed to save contract.");
    }
  };

  const handleEdit = (contract) => {
    setEditingContractId(contract.contractId);

    setFormData({
      providerId: contract.providerId || "",
      uploadedByUserId: contract.uploadedByUserId || authService.getCurrentUser()?.id || 1,
      documentName: contract.documentName || "",
      documentUrl: contract.documentUrl || "",
      effectiveFrom: contract.effectiveFrom || "",
      effectiveTo: contract.effectiveTo || "",
      status: contract.status || "ACTIVE",
    });
  };

  const handleRemove = async (id) => {
    const confirmRemove = window.confirm(
      "Are you sure you want to remove this contract?"
    );

    if (!confirmRemove) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await removeContract(id);
      setMessage("Contract removed successfully.");
      void loadContracts();
    } catch {
      setError("Failed to remove contract.");
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void loadContracts();
      void loadProviders();
    });
  }, []);

  return (
    <div>
      <div className="sticky-page-header">
        <div className="page-header">
          <div>
            <h1>Contracts</h1>
            <p>Track contract lifecycle, legal files, and validity windows.</p>
          </div>
          <SegmentedTabs
            tabs={[
              { key: "list", label: "Contract List" },
              { key: "manage", label: editingContractId ? "Update Contract" : "Add Contract" },
            ]}
            activeKey={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div
        className="content-grid"
        style={{
          gridTemplateColumns:
            activeTab === "manage"
              ? "minmax(360px, 460px) minmax(0, 1fr)"
              : "minmax(0, 1fr)",
        }}
      >
        {activeTab === "manage" && (
          <div className="form-card">
          <h2>{editingContractId ? "Update Contract" : "Add Contract"}</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Provider</label>
              <select
                name="providerId"
                value={formData.providerId}
                onChange={handleChange}
                required
              >
                <option value="">Select Provider</option>
                {providers.map((provider) => (
                  <option
                    key={provider.providerId}
                    value={provider.providerId}
                  >
                    {provider.providerName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Document Name</label>
              <input
                type="text"
                name="documentName"
                value={formData.documentName}
                onChange={handleChange}
                placeholder="Example: City Rent Contract 2026"
                required
              />
            </div>

            <div className="form-group">
              <label>Document Upload (PDF)</label>
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleDocumentUpload}
                disabled={isUploadingDocument}
              />
              {isUploadingDocument && (
                <p className="muted-text" style={{ marginTop: "8px" }}>
                  Uploading document...
                </p>
              )}
              {formData.documentUrl && (
                <p className="muted-text" style={{ marginTop: "8px" }}>
                  Uploaded:{" "}
                  <a href={formData.documentUrl} target="_blank" rel="noopener noreferrer">
                    Open Document
                  </a>
                </p>
              )}
            </div>

            <div className="form-group">
              <label>Effective From</label>
              <input
                type="date"
                name="effectiveFrom"
                value={formData.effectiveFrom}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Effective To</label>
              <input
                type="date"
                name="effectiveTo"
                value={formData.effectiveTo}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="REMOVED">REMOVED</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-button" disabled={isUploadingDocument}>
                {editingContractId ? "Update Contract" : "Add Contract"}
              </button>

              {editingContractId && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        )}

        <div className="table-card">
          <h2>Uploaded Contracts</h2>

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Provider</th>
                <th>Document</th>
                <th>Effective From</th>
                <th>Effective To</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <SkeletonRows rows={6} columns={7} />
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table">
                    <EmptyState
                      title="No Contracts Yet"
                      description="Add a contract to connect providers with vehicles."
                    />
                  </td>
                </tr>
              ) : (
                contracts.map((contract) => (
                  <tr key={contract.contractId}>
                    <td>{contract.contractId}</td>
                    <td>{contract.providerName}</td>
                    <td>
                      <strong>{contract.documentName}</strong>
                      <br />
                      {contract.documentUrl ? (
                        <span className="muted-text">
                          <a
                            href={contract.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open PDF
                          </a>
                        </span>
                      ) : (
                        <span className="muted-text">No document uploaded</span>
                      )}
                    </td>
                    <td>{contract.effectiveFrom}</td>
                    <td>{contract.effectiveTo || "N/A"}</td>
                    <td>
                      <span
                        className={
                          contract.status === "ACTIVE"
                            ? "status-active"
                            : "status-inactive"
                        }
                      >
                        {contract.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="small-button"
                        onClick={() => {
                          handleEdit(contract);
                          setActiveTab("manage");
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="danger-button"
                        onClick={() => handleRemove(contract.contractId)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Contracts;
