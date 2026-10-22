"""
CityEye Academic Presentation Chart Generator
Generates high-resolution (300 DPI) professional graphs for college PPT slides:
1. model_accuracy_progression.png
2. per_class_accuracy_breakdown.png
3. overall_performance_summary.png
"""

import os
import matplotlib.pyplot as plt
import numpy as np

OUTPUT_DIR = r"F:\Projects\CITYEYE-Dipesh\files\presentation_charts"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Set high-quality visual style
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = 'Arial'
plt.rcParams['font.family'] = 'sans-serif'

# -----------------------------------------------------------------------------
# GRAPH 1: MODEL ACCURACY PROGRESSION (Baseline vs Run 1 vs Run 2)
# -----------------------------------------------------------------------------
def generate_progression_chart():
    fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
    
    stages = [
        '1. Baseline Model\n(Unfine-tuned)',
        '2. Single-Class Model\n(Potholes Only)',
        '3. CityEye Multi-Class\n(Pothole + Garbage + Water)'
    ]
    
    precision = [2.9, 40.1, 67.6]
    recall = [19.2, 24.8, 49.7]
    map50 = [1.4, 26.2, 55.5]
    
    x = np.arange(len(stages))
    width = 0.25
    
    rects1 = ax.bar(x - width, precision, width, label='Precision (%)', color='#2563EB', edgecolor='black', linewidth=0.8)
    rects2 = ax.bar(x, recall, width, label='Recall (%)', color='#0D9488', edgecolor='black', linewidth=0.8)
    rects3 = ax.bar(x + width, map50, width, label='mAP@50 (%)', color='#F59E0B', edgecolor='black', linewidth=0.8)
    
    ax.set_ylabel('Score Percentage (%)', fontsize=12, fontweight='bold', labelpad=10)
    ax.set_title('CityEye AI Model Accuracy Progression Across Iterations', fontsize=15, fontweight='bold', pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(stages, fontsize=11, fontweight='medium')
    ax.set_ylim(0, 85)
    ax.legend(frameon=True, facecolor='white', framealpha=0.9, fontsize=11, loc='upper left')
    
    # Add value labels on bars
    for rects in [rects1, rects2, rects3]:
        for rect in rects:
            h = rect.get_height()
            ax.annotate(f'{h:.1f}%',
                        xy=(rect.get_x() + rect.get_width() / 2, h),
                        xytext=(0, 4),
                        textcoords="offset points",
                        ha='center', va='bottom', fontsize=10, fontweight='bold')
            
    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "model_accuracy_progression.png")
    plt.savefig(out_path, dpi=300)
    plt.close()
    print(f"[OK] Generated: {out_path}")

# -----------------------------------------------------------------------------
# GRAPH 2: PER-CLASS DETECTION ACCURACY BREAKDOWN
# -----------------------------------------------------------------------------
def generate_per_class_chart():
    fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
    
    classes = ['Potholes (Road Hazards)', 'Garbage (Illegal Dumps)', 'Waterlogging (Street Flooding)']
    precision = [58.3, 74.4, 70.1]
    recall = [39.9, 44.8, 64.5]
    map50 = [42.8, 52.6, 71.0]
    
    x = np.arange(len(classes))
    width = 0.25
    
    rects1 = ax.bar(x - width, precision, width, label='Precision (%)', color='#4F46E5', edgecolor='black', linewidth=0.8)
    rects2 = ax.bar(x, recall, width, label='Recall (%)', color='#10B981', edgecolor='black', linewidth=0.8)
    rects3 = ax.bar(x + width, map50, width, label='mAP@50 (%)', color='#EC4899', edgecolor='black', linewidth=0.8)
    
    ax.set_ylabel('Metric Score (%)', fontsize=12, fontweight='bold', labelpad=10)
    ax.set_title('Per-Category Performance Breakdown: CityEye YOLOv8s Model', fontsize=15, fontweight='bold', pad=15)
    ax.set_xticks(x)
    ax.set_xticklabels(classes, fontsize=11, fontweight='bold')
    ax.set_ylim(0, 90)
    ax.legend(frameon=True, facecolor='white', framealpha=0.9, fontsize=11, loc='upper right')
    
    for rects in [rects1, rects2, rects3]:
        for rect in rects:
            h = rect.get_height()
            ax.annotate(f'{h:.1f}%',
                        xy=(rect.get_x() + rect.get_width() / 2, h),
                        xytext=(0, 4),
                        textcoords="offset points",
                        ha='center', va='bottom', fontsize=10, fontweight='bold')
            
    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "per_class_accuracy_breakdown.png")
    plt.savefig(out_path, dpi=300)
    plt.close()
    print(f"[OK] Generated: {out_path}")

# -----------------------------------------------------------------------------
# GRAPH 3: SYSTEM EVALUATION RADAR / METRIC DASHBOARD
# -----------------------------------------------------------------------------
def generate_summary_dashboard():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5.5), dpi=300)
    
    # Subplot 1: Dataset Volume Contribution (Pie)
    categories = ['Potholes & Road Cracks\n(1,248 train / 542 val)', 
                  'Municipal Waste & Garbage\n(7,893 train / 1,595 val)', 
                  'Waterlogging & Street Floods\n(1,671 train / 282 val)']
    counts = [1790, 9488, 1953]
    colors = ['#3B82F6', '#10B981', '#06B6D4']
    explode = (0.05, 0.05, 0.05)
    
    wedges, texts, autotexts = ax1.pie(counts, labels=categories, autopct='%1.1f%%',
                                      startangle=140, colors=colors, explode=explode,
                                      textprops={'fontsize': 10, 'weight': 'bold'})
    for at in autotexts:
        at.set_color('white')
        at.set_fontsize(11)
    ax1.set_title('Dataset Annotation Distribution (Total: 13,231 Instances)', fontsize=13, fontweight='bold', pad=10)
    
    # Subplot 2: Real-time CCTV Inference Latency vs Multi-Frame Stability
    metrics = ['Standard YOLO\nInference', 'CLAHE Contrast\nEnhancement', 'Multi-Frame IoU\nTracking', 'Total End-to-End\nLatency']
    times_ms = [106.2, 2.1, 0.8, 109.1] # from validation run log
    bar_colors = ['#6366F1', '#8B5CF6', '#EC4899', '#EF4444']
    
    bars = ax2.barh(metrics, times_ms, color=bar_colors, edgecolor='black', linewidth=0.8, height=0.55)
    ax2.set_xlabel('Processing Latency per CCTV Frame (Milliseconds)', fontsize=11, fontweight='bold')
    ax2.set_title('CCTV Edge Pipeline Latency (~10 FPS CPU / 35+ FPS GPU)', fontsize=13, fontweight='bold', pad=10)
    ax2.set_xlim(0, 130)
    
    for bar in bars:
        w = bar.get_width()
        ax2.annotate(f'{w:.1f} ms',
                     xy=(w, bar.get_y() + bar.get_height() / 2),
                     xytext=(5, 0),
                     textcoords="offset points",
                     ha='left', va='center', fontsize=10, fontweight='bold')
        
    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "pipeline_performance_summary.png")
    plt.savefig(out_path, dpi=300)
    plt.close()
    print(f"[OK] Generated: {out_path}")

if __name__ == "__main__":
    generate_progression_chart()
    generate_per_class_chart()
    generate_summary_dashboard()
    print("[ALL DONE] Charts generated successfully in F:\\Projects\\CITYEYE-Dipesh\\files\\presentation_charts")
